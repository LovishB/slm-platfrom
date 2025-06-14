export class AgentChatDto {
  agent_id: string;
  user_wallet: string;
  chat_history: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}