import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plaza, Lugar } from './entities';
import { Area } from '../auth/entities/area.entity';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([ Plaza, Lugar, Area ])
  ]
})
export class EventModule {}
