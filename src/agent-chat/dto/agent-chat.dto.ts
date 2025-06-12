export class AgentChatDto {
  agent_id: string;
  user_wallet: string;
  agent_prompt: string;
  chat_history: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}