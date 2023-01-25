import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { UnauthorizedException } from '@nestjs/common';
import { Injectable } from "@nestjs/common";

import { Repository } from "typeorm";

import { ExtractJwt, Strategy } from "passport-jwt";

import { Usuario } from '../entities/usuario.entity';

import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,

    configService: ConfigService
  ){
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
  }

  async validate (payload: IJwtPayload): Promise<Usuario> {
    const { matricula } = payload

    const user = await this.userRepository.findOneBy({ matricula })

    if( !user )
      throw new UnauthorizedException('Token no valido')
    
    if( !user.activo )
      throw new UnauthorizedException('Usuario inactivo, hablar con el administrador')

    return user;
  }

}