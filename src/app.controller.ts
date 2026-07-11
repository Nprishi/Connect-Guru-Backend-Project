import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      success: true,
      message: 'Connect Guru API is running successfully',
      version: '1.0.0',
    };
  }
}
