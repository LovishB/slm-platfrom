import { Controller, Post, Body, Logger, Get, Query } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { ApiTags, ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger';
import { createAgentSchemaExample } from './schema/agents.schema';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  logger = new Logger(AgentsController.name);
  constructor(private readonly agentsService: AgentsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiBody({
    type: CreateAgentDto,
    examples: createAgentSchemaExample
  })
  async createAgent(@Body() createAgentDto: CreateAgentDto) {
    this.logger.log('API CALLED - POST /agents/create');
    return this.agentsService.createAgent(createAgentDto);
  }

  @Get()
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiOperation({ summary: 'Get all agents with pagination' })
  async getAllAgents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(`API CALLED - GET /agents?page=${page}&limit=${limit}`);
    return this.agentsService.getAllAgents({ page, limit });
  }

  @Get('by-user')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiOperation({ summary: 'Get agents by user with pagination' })
  async getAgentsByUser(
    @Query('user_wallet') ownerWallet: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(
      `API CALLED - GET /agents/by-user?user_wallet=${ownerWallet}&page=${page}&limit=${limit}`,
    );
    return this.agentsService.getAgentsByUser({ ownerWallet, page, limit });
  }

  @Get('by-agent-id')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiOperation({ summary: 'Get agent by agent id' })
  async getAgentById(@Query('agentId') agentId: string) {
    this.logger.log(`API CALLED - GET /agents/by-agent-id/${agentId}`);
    return this.agentsService.getAgentById(agentId);
  }

  @Get('count')
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiOperation({ summary: 'Get total number of agents' })
  async getTotalAgents() {
    this.logger.log('API CALLED - GET /agents/count');
    return this.agentsService.getTotalAgents();
  }

}
