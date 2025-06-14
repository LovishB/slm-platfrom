import { Body, Controller, Post } from '@nestjs/common';
import { PinecodeService } from './pinecode.service';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Pinecode')
@Controller('pinecode')
export class PinecodeController {
    // constructor(private readonly pinecodeService: PinecodeService) {}

    // @Post('train')
    // @ApiOperation({ summary: 'Test api to check RAG' })
    // @ApiHeader({
    //     name: 'x-api-key',
    //     description: 'API key of Backend',
    //     required: true,
    //     schema: { type: 'string' }
    // })
    // @ApiBody({
    //     schema: {
    //       type: 'object',
    //       properties: {
    //         docs_url: { type: 'string', example: 'https://iweagijnpehulugywkkq.supabase.co/storage/v1/object/public/agents-docs//defi.txt' },
    //         id: { type: 'string', example: 'c32543c6-ab0d-4599-a1a4-e8e08f2fb6db' }
    //       },
    //       required: ['docs_url', "id"],
    //     }
    // })
    // async trainAgent(@Body() body: { docs_url: string }) {
    //     return this.pinecodeService.trainAgent(body);
    // }

    // @Post('search')
    // @ApiOperation({ summary: 'Test api to check RAG' })
    // @ApiHeader({
    //     name: 'x-api-key',
    //     description: 'API key of Backend',
    //     required: true,
    //     schema: { type: 'string' }
    // })
    // @ApiBody({
    //     schema: {
    //       type: 'object',
    //       properties: {
    //         query: { type: 'string', example: 'What are different degrees of decentralization?' },
    //         id: { type: 'string', example: 'c32543c6-ab0d-4599-a1a4-e8e08f2fb6db' }
    //       },
    //       required: ['query', "id"],
    //     }
    // })
    // async searchAgent(@Body() body: { docs_url: string }) {
    //     return this.pinecodeService.getAgentContext(body);
    // }
}
