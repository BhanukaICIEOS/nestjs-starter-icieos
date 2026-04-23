import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { AuthorizationGuard, JwtAuthGuard } from './common/guards';
import { Permissions } from './common/decorators/permission.decorator';
import { Resource } from './modules/roles/enums/resource.enum';
import { Action } from './modules/roles/enums/action.enum';

@Controller()
@UseGuards(JwtAuthGuard, AuthorizationGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  @Permissions([
      {
        resource: Resource.settings,
        actions: [Action.create],
      },
    ])
  getProfile(@Req() req) {
    return {
      message: 'This is a protected route',
      userId: req.userId, // This will be set by the JwtAuthGuard if the token is valid
    };
  }
}
