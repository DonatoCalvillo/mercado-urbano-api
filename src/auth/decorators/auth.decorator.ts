import { applyDecorators, UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';

import { ValidRoles, RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected( ...roles ),
    UseGuards( AuthGuard(), UserRoleGuard )
  )
}