// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('testlogin')
  getHello(): string {
    return this.appService.getHello();
  }

  loginMember(): string {
    return this.appService.loginMember();
  }
}
