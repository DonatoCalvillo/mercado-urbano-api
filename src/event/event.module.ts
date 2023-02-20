import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plaza, Lugar } from './entities';
import { Area } from '../auth/entities/area.entity';
import { Evento } from './entities/evento.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { UsuarioEvento } from './entities/usuario-evento.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([ Plaza, Lugar, Area, Evento, Usuario, UsuarioEvento ]),
    AuthModule
  ]
})
export class EventModule {}
