import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { Usuario, Rol, Area } from './entities';
import { UsuarioEvento } from '../event/entities/usuario-evento.entity';
import { HttpResponse } from './strategies/errors.strategy';
import { UserValidation } from './strategies/user.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, HttpResponse, UserValidation],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Usuario, Rol, Area, UsuarioEvento]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '8h',
          },
        };
      },
    }),
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    HttpResponse,
  ],
})
export class AuthModule {}
