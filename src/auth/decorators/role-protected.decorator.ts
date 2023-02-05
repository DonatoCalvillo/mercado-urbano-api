import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';

export enum ValidRoles {
  admin = 'Administrador',
  superUser = 'SuperAdministrador',
  user = 'Usuario'
}

export const RoleProtected = (...args: ValidRoles[]) =>{
  console.log('Entre')
  return SetMetadata(META_ROLES, args);
}