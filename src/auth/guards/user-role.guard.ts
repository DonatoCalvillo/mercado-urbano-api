import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BadRequestException, ForbiddenException } from '@nestjs/common/exceptions';

import { Observable } from 'rxjs';

import { Usuario } from '../entities/usuario.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler() )
    
    if( !validRoles ) return true 
    if( validRoles.length === 0 ) return true

    const req = context.switchToHttp().getRequest()
    const user = req.user as Usuario

    if( !user )
      throw new BadRequestException('Usuario no encontrado en el token')

    const {nombre} = user.rol
    if(validRoles.includes(nombre))
      return true;

    throw new ForbiddenException(
      `Usuario ${ user.nombre } necesita un rol valido`
    )
  }
}
