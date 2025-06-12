import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AgentChatService } from './agent-chat.service';
import { AgentChatDto } from './dto/agent-chat.dto';
import { agentChatSchemaExample } from './schema/agent-chat.schema';

@ApiTags('Agent Chat')
@Controller('chat')
export class AgentChatController {
    logger = new Logger(AgentChatController.name);

    constructor(private readonly agentChatService: AgentChatService) {}

    @Post('')
    @ApiOperation({ summary: 'Chat with an agent' })
    @ApiHeader({
      name: 'x-api-key',
      description: 'API key of Backend',
      required: true,
      schema: { type: 'string' }
    })
    @ApiBody({ 
      type: AgentChatDto,
      examples: agentChatSchemaExample
    })
    async chatWithAgent(@Body() agentChatDto: AgentChatDto) {
      this.logger.log('API CALLED - POST /chat');
      return this.agentChatService.chatWithAgent(agentChatDto);
    }
}
