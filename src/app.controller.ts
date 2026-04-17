import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  getProfile(@Req() req) {
    return {
      message: 'This is a protected route',
      userId: req.userId, // This will be set by the JwtAuthGuard if the token is valid
    };
  }
}
