import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { PinecodeService } from 'src/pinecode/pinecode.service';

export const AGENT_CREATION_FEE = 10;

@Injectable()
export class AgentsService {
  logger = new Logger(AgentsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly pinecodeService: PinecodeService
  ) {}

  // Function to create an agent
  async createAgent(createAgentDto: CreateAgentDto) {
    try {
      // Check if agent name is already taken
      const existingAgent = await this.supabaseService.isAgentNameTaken(createAgentDto.name);

      if (existingAgent) {
        this.logger.warn(`Agent name "${createAgentDto.name}" is already taken`);
        throw new BadRequestException('Agent name is already taken');
      }

      // Check if user exists, if not create one
      let { data: user, error: userError } = await this.supabaseService.getUserByWallet(createAgentDto.owner_wallet);
      if (userError && userError.code !== 'PGRST116') { // PGRST116: No rows found
        this.logger.error('Error fetching user', userError);
        throw new BadRequestException('Failed to fetch user');
      }
      if (!user) {
        const { data: newUser, error: insertUserError } = await this.supabaseService.insertUserByWallet(createAgentDto.owner_wallet);
        if (insertUserError || !newUser) {
          this.logger.error('Failed to create user', insertUserError);
          throw new BadRequestException('Failed to create user');
        }
        user = newUser;
      }

      // Ensure user has enough tokens
      if (user.tokens < AGENT_CREATION_FEE) {
        this.logger.warn(`User ${user.wallet} does not have enough tokens to create an agent`);
        throw new BadRequestException('Not enough tokens to create an agent');
      }

      // Set default values including owner_id
      const agentToCreate = {
        ...createAgentDto,
        tokens: 0,
        status: 'building',
        owner_id: user.id,
      };

      // Create the agent
      let { data: createdAgent, error: agentError } = await this.supabaseService.createAgent(agentToCreate);
      if (!createdAgent && agentError) {
        this.logger.error('Failed to create agent', agentError);
        throw new BadRequestException('Failed to create agent');
      }
      this.logger.log(`Agent created with ID: ${createdAgent.id}`);

      // Once the agent is created, transfer tokens from the user to the agent
      this.supabaseService.transferTokensFromUserToAgent(
        user.id, 
        createdAgent.id, 
        AGENT_CREATION_FEE
      ).catch(err => {
        this.logger.error(`Failed to transfer tokens from user ${user.wallet} to agent ${createdAgent.id}`, err);
      });

      // Send agent for RAG training
      this.pinecodeService.trainAgent(createdAgent).catch(err => {
        this.logger.error(`Failed to train agent ${createdAgent.id}`, err);
      });

      return { message: 'Agent created', agent: createdAgent };
    } catch (err) {
      this.logger.error('Error in createAgent', err);
      throw new BadRequestException('Failed to create agent');
    }
  }

  // Function to get all agents with pagination
  async getAllAgents({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    try {
      const offset = (page - 1) * limit;
      const { data: agents, error } = await this.supabaseService.getAllAgents({ limit, offset });

      if (error) {
        this.logger.error('Failed to fetch agents', error);
        throw new BadRequestException('Failed to fetch agents');
      }

      return {
        page,
        limit,
        agents,
      };
    } catch (err) {
      this.logger.error('Error in getAllAgents', err);
      throw new BadRequestException('Failed to fetch agents');
    }
  }

  // Function to get agents by user (ownerWallet)
  async getAgentsByUser({ ownerWallet, page = 1, limit = 10 }: { ownerWallet: string; page?: number; limit?: number }) {
    try {
      const offset = (page - 1) * limit;
      const { data: agents, error } = await this.supabaseService.getAgentsByUser({ ownerWallet, limit, offset });

      if (error) {
        this.logger.error('Failed to fetch agents by user', error);
        throw new BadRequestException('Failed to fetch agents by user');
      }

      return {
        ownerWallet,
        page,
        limit,
        agents,
      };
    } catch (err) {
      this.logger.error('Error in getAgentsByOwner', err);
      throw new BadRequestException('Failed to fetch agents by owner');
    }
  }

  // Function to get agent by agentId
  async getAgentById(agentId: string) {
    try {
      const { data: agent, error } = await this.supabaseService.getAgentById(agentId);

      if (!agent) {
        this.logger.warn(`Agent with id ${agentId} not found`);
        throw new BadRequestException('Agent not found');
      }

      if (error) {
        this.logger.error(`Failed to fetch agent with id ${agentId}`, error);
        throw new BadRequestException('Failed to fetch agent');
      }
      
      return agent;
    } catch (err) {
      this.logger.error('Error in getAgentById', err);
      throw new BadRequestException('Failed to fetch agent');
    }
  }

  // Function to get total number of agents
  async getTotalAgents() {
    try {
      const { data: count, error } = await this.supabaseService.getTotalAgentsCount();
      if (error) {
        this.logger.error('Failed to fetch total agents count', error);
        throw new BadRequestException('Failed to fetch total agents count');
      }
      return { total: count };
    } catch (err) {
      this.logger.error('Error in getTotalAgents', err);
      throw new BadRequestException('Failed to fetch total agents count');
    }
  }

  
}
