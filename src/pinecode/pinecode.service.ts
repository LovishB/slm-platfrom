import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { get_encoding } from '@dqbd/tiktoken';
import { Index, Pinecone } from '@pinecone-database/pinecone'

const enc = get_encoding('cl100k_base');
const CHUNK_SIZE = 2048;
const OVERLAP = 256;

@Injectable()
export class PinecodeService {
    private pinecone: Pinecone;
    private index: Index;

    constructor(private readonly supabaseService: SupabaseService) {
        const pineconeKey = process.env.PINECONE_API_KEY;
        if (!pineconeKey) {
            throw new Error('Pinecone API key is not defined in environment variables');
        }
        this.pinecone = new Pinecone({ apiKey: pineconeKey });
        this.index = this.pinecone.index('llama-text-embed-v2');
    }

    async onModuleInit() {

    }

    async trainAgent(agent: any) {
        // Get agent documentation from supabase
        const buffer = await this.supabaseService.readStorageFile(agent.docs_url);
        const text = buffer.toString('utf-8');

        // Make token chunks for training
        const allTokens = enc.encode(text);
        const chunks: {'id': string, 'text': string}[] = [];
        for (let i = 0; i < allTokens.length; i += CHUNK_SIZE - OVERLAP) {
            const chunkTokens = allTokens.slice(i, i + CHUNK_SIZE);
            const chunkDecoded = enc.decode(chunkTokens) as Uint8Array;
            const chunkText = new TextDecoder('utf-8').decode(chunkDecoded);
            const chunkId = `vec${chunks.length + 1}`;
            chunks.push({ id: chunkId, text: chunkText });        
        }
        console.log(`Total chunks created: ${chunks.length}`);

        // Upload chunks to Pinecone
        const namespace = this.pinecone.index('llama-text-embed-v2').namespace(agent.id.toString());
        await namespace.upsertRecords(chunks);

        // Update status of agent to 'live'
        await this.supabaseService.updateAgentStatus(agent.id, 'live');
    }

    async getAgentContext(agent_id: string, user_query: string) {
        const namespace = this.pinecone.index('llama-text-embed-v2').namespace(agent_id);
        const response = await namespace.searchRecords({
            query: {
                topK: 3,
                inputs: { text: user_query },
            }
        });

        for (const hit of response.result.hits) {
            const fields = hit.fields as { text: string };
            console.log(`Text: ${fields.text}`);
        }
    }
}
