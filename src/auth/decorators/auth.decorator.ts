import { applyDecorators, UseGuards } from '@nestjs/common/decorators';
import { ValidRoles, RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected( ...roles ),
    UseGuards( AuthGuard(), UserRoleGuard )
  )
}