export class CreateAgentDto {
  owner_wallet: string;
  name: string;
  prompt: string;
  image_url?: string;
  docs_url?: string;
  conversation_starters?: string[];
  description?: string;
}