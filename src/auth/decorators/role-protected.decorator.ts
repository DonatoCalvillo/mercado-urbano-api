import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';

export enum ValidRoles {
  admin = 'Administrador',
  superAdmin = 'SuperAdministrador',
  user = 'Usuario',
}

export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
