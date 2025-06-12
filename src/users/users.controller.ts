import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger';
import { createUserSchemaExample } from './schema/users.schema'; // <-- import the example

@ApiTags('Users')
@Controller('users')
export class UsersController {
  logger = new Logger(UsersController.name);
  
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new user with a wallet address' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletAddress: { type: 'string', example: '0x1234567890abcdef1234567890abcdef12345678' },
      },
      required: ['walletAddress'],
    },
    examples: createUserSchemaExample
  })
  async createUser(@Body('walletAddress') walletAddress: string) {
    this.logger.log('API CALLED - POST /users/create');
    return this.usersService.createUser(walletAddress);
  }

  @Get()
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key of Backend',
    required: true,
    schema: { type: 'string' }
  })
  @ApiOperation({ summary: 'Get user by wallet address' })
  async getUser(@Query('walletAddress') walletAddress: string) {
    this.logger.log('API CALLED - GET /users');
    return this.usersService.getUserByWalletAddress(walletAddress);
  }
}
