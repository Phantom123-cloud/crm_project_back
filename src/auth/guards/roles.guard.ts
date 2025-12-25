import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth-roles.decorator';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly rolesDataBuilder: RolesDataBuilder,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: any[] = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();

    const userRoles = await this.rolesDataBuilder.getRolesNameByUserId(user.id);
    if (!user.id || !requiredRoles) return false;

    const isAccess = userRoles.some((role) => requiredRoles.includes(role));

    return isAccess;
  }
}
