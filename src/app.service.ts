import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Server is running! Welcome to the Agents Backend API.';
  }
}
