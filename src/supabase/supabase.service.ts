import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    logger = new Logger(SupabaseService.name);
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = 'https://iweagijnpehulugywkkq.supabase.co';
        const supabaseKey = process.env.SUPABASE_KEY;
        if (!supabaseKey) {
            throw new Error('Supabase key is not defined in environment variables');
        }
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }

    // Function to get user by wallet address
    async getUserByWallet(walletAddress: string) {
        return await this.supabase
            .from('users')
            .select('*')
            .eq('wallet', walletAddress)
            .single();
    }

    // Function to insert a new user by wallet address
    async insertUserByWallet(walletAddress: string) {
        return await this.supabase
            .from('users')
            .insert([{ wallet: walletAddress, tokens: 100 }])
            .select()
            .single();
    }

    // Function to check if agent name is already taken
    async isAgentNameTaken(agentName: string) {
        const { data, error } = await this.supabase
            .from('agents')
            .select('id')
            .eq('name', agentName);

        if (error) {
            throw error;
        }
        return data && data.length > 0;
    }

    // Function to create a new agent
    async createAgent(createAgentDto: any) {
        const { data, error } = await this.supabase
            .from('agents')
            .insert([createAgentDto])
            .select()
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    // Function to get all agents with pagination, sorted by tokens DESC
    async getAllAgents({ limit = 10, offset = 0 }: { limit?: number; offset?: number }) {
        const { data, error } = await this.supabase
            .from('agents')
            .select('*')
            .order('tokens', { ascending: false })
            .range(offset, offset + limit - 1);

        return { data, error };
    }

    // Function to get agents by owner wallet with pagination, sorted by tokens DESC
    async getAgentsByUser({ ownerWallet, limit = 10, offset = 0 }: { ownerWallet: string; limit?: number; offset?: number }) {
        const { data, error } = await this.supabase
            .from('agents')
            .select('*')
            .eq('owner_wallet', ownerWallet)
            .range(offset, offset + limit - 1);

        return { data, error };
    }

    // Function to transfer tokens from user to agent
    async transferTokensFromUserToAgent(user_id: string, agent_id: string, transfer_amount: number): Promise<boolean> {
        const { error } = await this.supabase.rpc('transfer_tokens_user_to_agent', {
            user_id,
            agent_id,
            transfer_amount
        });

        if (error) {
            this.logger.error('Error transferring tokens from user to agent', error);
            return false;
        }

        return true;
    }

    async updateAgentStatus(agentId, newStatus: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('agents')
            .update({ status: newStatus })
            .eq('id', agentId)
            .single();

        if (error) {
            this.logger.error('Error updating agent status', error);
            return false;
        }
        return true;
    }

    // Function to read storage file
    async readStorageFile(fileURL: string): Promise<Buffer<ArrayBuffer>>{
        // Extract file path from the URL
        const basePath = '/storage/v1/object/public/agents-docs//';
        const pathStart = fileURL.indexOf(basePath);

        if (pathStart === -1) {
            this.logger.error(`Invalid Supabase public URL for agents-docs: ${fileURL}`);
            return Buffer.from(new ArrayBuffer(0));
        }

        const filePath = fileURL.substring(pathStart + basePath.length);
        const { data, error } = await this.supabase
            .storage
            .from('agents-docs')
            .download(filePath);

        if (error) {
            this.logger.error(`Error reading storage file ${filePath} from bucket agents-docs`, error);
            return Buffer.from(new ArrayBuffer(0));
        }

        return Buffer.from(await data.arrayBuffer());
    }
}
