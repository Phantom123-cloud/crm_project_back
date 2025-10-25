import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth-roles.decorator';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: any[] = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { id } = context.switchToHttp().getRequest() as JwtPayload;
    const userRoles = await this.roleService.getRolesByUserId(id);
    if (!id || !requiredRoles) return false;

    return userRoles.some((role) => requiredRoles.includes(role));
  }
}
