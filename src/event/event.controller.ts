import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { Auth, GetUser, ValidRoles } from 'src/auth/decorators';
import { Usuario } from '../auth/entities/usuario.entity';
import { SetLugarDto } from './dto/set-lugar.dto';

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService
  ) {}

  @Get('generarLugares')
  generarLugares() {
    return this.eventService.generarLugares();
  }

  @Get('eventList')
  @Auth( ValidRoles.user )
  getEvents( @GetUser() user: Usuario ){
    return this.eventService.getEvents(user);
  }

  @Post('createEvent')
  @Auth( ValidRoles.user )
  createEvent(@Body() createEventoDto: CreateEventoDto){
    return this.eventService.createEvent(createEventoDto);
  }

  @Get('validateInscription')
  @Auth( ValidRoles.user )
  validateInscription( @GetUser() user: Usuario ){
    return this.eventService.validateInscription(user)
  }

  @Get('getLugares')
  @Auth( ValidRoles.user )
  getLugares( @GetUser() user: Usuario ) {
    return this.eventService.getLugares(user)
  }

  @Post('setLugar')
  @Auth( ValidRoles.user )
  setLugar( @GetUser() user: Usuario, @Body() setLugar: SetLugarDto ){
    return this.eventService.setLugar( user, setLugar )
  }

}
