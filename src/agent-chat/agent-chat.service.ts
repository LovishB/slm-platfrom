import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AgentChatDto } from './dto/agent-chat.dto';
import { OpenRouterService } from '../open-router/open-router.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PinecodeService } from 'src/pinecode/pinecode.service';
import { generateSystemPrompt } from 'src/shared/llm-system.prompt';
import { encoding_for_model } from '@dqbd/tiktoken';

export const AGENT_CHAT_FEE = 1;
const enc = encoding_for_model("gpt2");

@Injectable()
export class AgentChatService {
    logger = new Logger(AgentChatService.name);

    constructor(
        private readonly openRouterService: OpenRouterService,
        private readonly supabaseService: SupabaseService,
        private readonly pineconeService: PinecodeService
    ) {}

    async chatWithAgent(agentChatDto: AgentChatDto) {
        try {
            this.logger.log(`Received chat request for agent ${agentChatDto.agent_id} from user ${agentChatDto.user_wallet}`);
            // Check if the user has enough tokens
            const { data: user, error } = await this.supabaseService.getUserByWallet(agentChatDto.user_wallet);
            if (error || !user || user.tokens < 1) {
                this.logger.warn(`User ${agentChatDto.user_wallet} does not have enough tokens`);
                throw new UnauthorizedException('User does not have enough tokens');
            }

            // Get agent details
            const { data: agent, error: agentError } = await this.supabaseService.getAgentById(agentChatDto.agent_id);
            if (agentError || !agent) {
                this.logger.warn(`Agent with ID ${agentChatDto.agent_id} not found`);
                throw new UnauthorizedException('Agent not found');
            }
            
            this.logger.log(`Found agent: ${agent.name} in domain ${agent.domain}`);
            // Add RAG context and agent prompt to chat history
            const messages = await this.addRAGContext(
                agentChatDto.chat_history,
                agent.id,
                agent.name,
                agent.domain,
                agent.prompt
            );
            const tokenInput = enc.encode(JSON.stringify(messages));
            this.logger.log(`Total tokens in the prompt: ${tokenInput.length}`);
            this.logger.log(`RAG context added`);

            // Call OpenRouter to get the response
            const response = await this.openRouterService.chatWithSLM(messages);

            
            const tokens = enc.encode(response!); // system + user content
            this.logger.log(`Total tokens in the response: ${tokens.length}`);

            // Transfer tokens from user to agent
            this.supabaseService.transferTokensFromUserToAgent(
                    user.id, 
                    agentChatDto.agent_id, 
                    AGENT_CHAT_FEE
            ).catch(err => {
                this.logger.error(`Failed to transfer tokens from user ${user.wallet} to agent ${agentChatDto.agent_id}`, err);
            });

            return { agent_id: agentChatDto.agent_id, response };
        } catch (error) {
            this.logger.error('Error in chatWithAgent:', error);
            throw error;
        }
    }

    async addRAGContext(
        chatHistory: {
            role: "user" | "assistant";
            content: string;
        }[],
        agent_id: string,
        agent_name: string,
        agent_domain: string,
        agent_prompt: string
    ): Promise<{   
            role: "user" | "assistant" | "system";
            content: string;
        }[]> 
    {
        try {
            // fetch the last user message from chat history
            const lastUserMessage = [...chatHistory].reverse().find(msg => msg.role === 'user')?.content || '';

            // Get the agent's context from pinecone
            const context = await this.pineconeService.getAgentContext(agent_id, lastUserMessage);
            const fullPromptString = generateSystemPrompt(
                        agent_name,
                        agent_domain,
                        agent_prompt,
                        context
                    );
            // const tokens = enc.encode(fullPromptString);
            // this.logger.log(`Total tokens in the prompt: ${tokens.length}`);

            return [
                {
                    role: 'system',
                    content: fullPromptString
                },
                ...chatHistory
            ];
        } catch (error) {
            this.logger.error('Error in addRAGContext:', error);
            throw error;
        }
    }
}
