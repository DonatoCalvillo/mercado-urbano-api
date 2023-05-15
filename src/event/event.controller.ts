import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Header,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { Auth, GetUser, ValidRoles } from 'src/auth/decorators';
import { Usuario } from '../auth/entities/usuario.entity';
import { SetLugarDto } from './dto/set-lugar.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelListDto } from './dto/update-puntos.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('generarLugares')
  generarLugares() {
    return this.eventService.generarLugares();
  }

  @Get('eventList')
  @Auth(ValidRoles.user)
  getEvents(@GetUser() user: Usuario) {
    return this.eventService.getEvents(user);
  }

  @Post('createEvent')
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  createEvent(@Body() createEventoDto: CreateEventoDto) {
    return this.eventService.createEvent(createEventoDto);
  }

  @Get('validateInscription')
  @Auth(ValidRoles.user)
  validateInscription(@GetUser() user: Usuario) {
    return this.eventService.validateInscription(user);
  }

  @Get('getLugares')
  @Auth(ValidRoles.user)
  getLugares(@GetUser() user: Usuario) {
    return this.eventService.getLugares(user);
  }

  @Post('setLugar')
  @Auth(ValidRoles.user)
  setLugar(@GetUser() user: Usuario, @Body() setLugar: SetLugarDto) {
    return this.eventService.setLugar(user, setLugar);
  }

  @Post('/getExcelList')
  @Header('Content-Type', 'text/xlsx')
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  async getExcelList(@Res() res: Response, @Body() excelListDto: ExcelListDto) {
    let result = await this.eventService.getExcelList(excelListDto);
    res.download(`${result}`);
  }

  @Get('/getActiveEvents')
  // @Auth( ValidRoles.user )
  getActiveEventa() {
    return this.eventService.getActiveEvents();
  }

  @Post('/setExcelList')
  @UseInterceptors(FileInterceptor('file'))
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  setExcelList(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 100 * 4 }),
          new FileTypeValidator({
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.eventService.setExcelList(file, id);
  }

  @Post('getEventHistory')
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  getUserHistory(@Body('matricula') matricula: string) {
    return this.eventService.getUserHistory(matricula);
  }
}
