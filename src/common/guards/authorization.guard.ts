import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { AuthService } from 'src/modules/auth/auth.service';
import { Permission } from 'src/modules/roles/dtos/role.dto';


@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    if (!request.userId) {
      throw new UnauthorizedException('User Id not found');
    }

    const routePermissions: Permission[] = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      // get route handler and controller class metadata
      [context.getHandler(), context.getClass()],
    );
    console.log(routePermissions);

    if (!routePermissions) {
        return true;
    }

    try {
      const userPermissions = await this.authService.getUserPermissions(
        request.userId,
      );

      for (const routePermission of routePermissions) {
        const userPermission = userPermissions.find(
          (perm) => perm.resource === routePermission.resource,
        );

        if (!userPermission) throw new ForbiddenException();

        const allActionsAvailable = routePermission.actions.every(
          (requiredAction) => userPermission.actions.includes(requiredAction),
        );
        if (!allActionsAvailable) throw new ForbiddenException();
      }
    } catch (e) {
      throw new ForbiddenException();
    }

    return true;
  }
}