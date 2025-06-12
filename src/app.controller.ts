import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App') 
@Controller()
export class AppController {
  logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Call this endpoint to check if server is up' })
  getHello(): string {
    this.logger.log('API CALLED - GET /');
    return this.appService.getHello();
  }
}
