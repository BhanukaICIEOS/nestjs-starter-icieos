import { Controller, Get, Inject, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { AuthorizationGuard, JwtAuthGuard, RolesGuard } from './common/guards';
import { Permissions } from './common/decorators/permission.decorator';
import { Resource } from './modules/roles/enums/resource.enum';
import { Action } from './modules/roles/enums/action.enum';
import { Roles } from './common/decorators';
import { UserRole } from './common/enums/user-role.enum';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

// The @UseInterceptors() decorator is used to apply interceptors in NestJS, 
// which are middleware-like classes that can intercept and transform incoming 
// requests and outgoing responses.

@UseInterceptors(CacheInterceptor)
@Controller("hi")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  @Roles(UserRole.ADMIN)
  getProfile(@Req() req) {
    return {
      message: 'This is a protected route',
      userId: req.userId, // This will be set by the JwtAuthGuard if the token is valid
    };
  }

  // @CacheTTL(60 * 1000) // Cache this route for 60 seconds
  @Public()
  @Get('students')
  async getStudents() {
    console.log("inside controller......")
    return this.appService.getStudents();
  }

}
