import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth-roles.decorator';
import { RolesService } from 'src/roles/roles.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly RolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: any[] = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { id } = context.switchToHttp().getRequest() as JwtPayload;
    const userRoles = await this.RolesService.getRolesByUserId(id);
    if (!id || !requiredRoles) return false;

    return userRoles.some((role) => requiredRoles.includes(role));
  }
}
