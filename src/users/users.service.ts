import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
    logger = new Logger(UsersService.name);
    
    constructor(private readonly supabaseService: SupabaseService) {}

    async createUser(walletAddress: string): Promise<any> {
        try {
            // Check if user already exists
            const { data: existingUser, error: fetchError } = await this.supabaseService.getUserByWallet(walletAddress);

            if (existingUser) {
                this.logger.warn(`User with wallet address ${walletAddress} already exists`);
                throw new BadRequestException('User already exists');
            }

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found
                this.logger.error('Error checking user existence', fetchError);
                throw new BadRequestException('Error checking user existence');
            }

            // Create new user
            const { data: newUser, error: insertError } = await this.supabaseService.insertUserByWallet(walletAddress);
            if (insertError) {
                this.logger.error('Error creating user', insertError);
                throw new BadRequestException('Error creating user');
            }

            this.logger.log(`User created with wallet address: ${walletAddress}`);
            return { message: 'User created', newUser: newUser };
        } catch (err) {
            this.logger.error('Error in createUser', err);
            throw new BadRequestException('Failed to create user');
        }
    }

    // New function to get user by wallet address
    async getUserByWalletAddress(walletAddress: string): Promise<any> {
        try {
            const { data: user, error } = await this.supabaseService.getUserByWallet(walletAddress);
            if (!user) {
                this.logger.warn(`User with wallet address ${walletAddress} not found`);
                throw new NotFoundException('User not found');
            }
            if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
                this.logger.error('Error fetching user', error);
                throw new BadRequestException('Error fetching user');
            }

            return user;
        } catch (err) {
            this.logger.error('Error in getUserByWalletAddress', err);
            throw new BadRequestException('Failed to fetch user');
        }
    }
}
