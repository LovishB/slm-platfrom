import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AgentChatDto } from './dto/agent-chat.dto';
import { OpenRouterService } from '../open-router/open-router.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PinecodeService } from 'src/pinecode/pinecode.service';

export const AGENT_CHAT_FEE = 1;

@Injectable()
export class AgentChatService {
    logger = new Logger(AgentChatService.name);

    constructor(
        private readonly openRouterService: OpenRouterService,
        private readonly supabaseService: SupabaseService,
        private readonly pineconeService: PinecodeService
    ) {}

    async chatWithAgent(agentChatDto: AgentChatDto) {
        // Check if the user has enough tokens
        const { data: user, error } = await this.supabaseService.getUserByWallet(agentChatDto.user_wallet);
        if (error || !user || user.tokens < 1) {
            this.logger.warn(`User ${agentChatDto.user_wallet} does not have enough tokens`);
            throw new UnauthorizedException('User does not have enough tokens');
        }
        
        // Add RAG context and agent prompt to chat history
        const messages = await this.addRAGContext(
            agentChatDto.chat_history,
            agentChatDto.agent_prompt,
            agentChatDto.agent_id
        );

        // Call OpenRouter to get the response
        const response = await this.openRouterService.chatWithSLM(messages);

        // Transfer tokens from user to agent
        this.supabaseService.transferTokensFromUserToAgent(
                user.id, 
                agentChatDto.agent_id, 
                AGENT_CHAT_FEE
        ).catch(err => {
            this.logger.error(`Failed to transfer tokens from user ${user.wallet} to agent ${agentChatDto.agent_id}`, err);
        });

        return { agent_id: agentChatDto.agent_id, response };
    }

    async addRAGContext(
        chatHistory: {
            role: "user" | "assistant";
            content: string;
        }[], 
        agent_prompt: string,
        agent_id: string
    ): Promise<{   
            role: "user" | "assistant" | "system";
            content: string;
        }[]> 
    {
        // fetch the last user message from chat history
        const lastUserMessage = [...chatHistory].reverse().find(msg => msg.role === 'user')?.content || '';

        // Get the agent's context from pinecone
        const context = await this.pineconeService.getAgentContext(agent_id, lastUserMessage);
        return [
            {
                role: 'system',
                content: `You are a helpful assistant. Use the following description to answer the user's questions: ${agent_prompt}. Use this context to answer the user's questions as accurately as possible ${context}. If you don't know the answer, say "I am not aware".`,
            },
            ...chatHistory
        ];
    }
}
