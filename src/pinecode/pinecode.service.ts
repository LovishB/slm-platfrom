import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { get_encoding } from '@dqbd/tiktoken';
import { Index, Pinecone } from '@pinecone-database/pinecone'

const enc = get_encoding('cl100k_base');
const CHUNK_SIZE = 240;
const OVERLAP = 40;

@Injectable()
export class PinecodeService {
    private readonly logger = new Logger(PinecodeService.name);
    private pinecone: Pinecone;

    constructor(private readonly supabaseService: SupabaseService) {
        const pineconeKey = process.env.PINECONE_API_KEY;
        if (!pineconeKey) {
            throw new Error('Pinecone API key is not defined in environment variables');
        }
        this.pinecone = new Pinecone({ apiKey: pineconeKey });
    }

    async trainAgent(agent: any) {
        // Get agent documentation from supabase
        const buffer = await this.supabaseService.readStorageFile(agent.docs_url);
        const text = buffer.toString('utf-8');
        if (!text) {
            throw new Error('No documentation found for agent');
        }
        this.logger.log(`Training documentation found for agent ${agent.name}`);

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
        this.logger.log(`Total chunks created for RAG: ${chunks.length}`);

        // Upload chunks to Pinecone
        const namespace = this.pinecone.index('llama-text-embed-v2').namespace(agent.id.toString());
        await namespace.upsertRecords(chunks);
        this.logger.log(`Uploaded ${chunks.length} chunks to Pinecone for agent ${agent.name}`);

        // Update status of agent to 'live'
        await this.supabaseService.updateAgentStatus(agent.id, 'live');
        this.logger.log(`Agent ${agent.name} is now live`);
    }

    async getAgentContext(agent_id: string, user_query: string): Promise<string> {
        const namespace = this.pinecone.index('llama-text-embed-v2').namespace(agent_id);
        const response = await namespace.searchRecords({
            query: {
                topK: 4,
                inputs: { text: user_query },
            }
        });

        // Concatenate all fields.text values
        const context = response.result.hits
            .map(hit => (hit.fields as { text: string }).text)
            .join(' ');

        return context;
    }
}
