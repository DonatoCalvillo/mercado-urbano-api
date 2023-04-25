import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lugar, Plaza, Evento } from './entities';
import { Repository } from 'typeorm';
import { Area } from 'src/auth/entities';
import {
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { CreateEventoDto } from './dto/create-evento.dto';
import { Usuario } from '../auth/entities/usuario.entity';
import { UsuarioEvento } from './entities/usuario-evento.entity';
import { SetLugarDto } from './dto/set-lugar.dto';
import { Workbook, Worksheet } from 'exceljs';
import * as tmp from 'tmp';
import { ExcelListDto } from './dto/update-puntos.dto';
import { ValidLogTypes, logStandar } from 'src/helper/logStandar';
import { IResponse } from 'src/interface/response.interface';
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Lugar)
    private readonly lugarRepository: Repository<Lugar>,

    @InjectRepository(Plaza)
    private readonly plazaRepository: Repository<Plaza>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(UsuarioEvento)
    private readonly usuarioEventoRepository: Repository<UsuarioEvento>,
  ) {}

  async getLugares(user: Usuario) {
    try {
      const lugares = await this.lugarRepository
        .createQueryBuilder('lugar')
        .select(['lugar.id', 'lugar.numero', 'area.nombre'])
        .where('lugar.ocupado = 0')
        .andWhere('area.nombre =:nombreArea', { nombreArea: user.area.nombre })
        .innerJoin('lugar.area', 'area')
        .orderBy('lugar.numero')
        .getRawMany();

      return lugares;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async generarLugares() {
    try {
      const plaza = await this.plazaRepository.findOne({
        where: { id: 'e7f146b6-a8bb-11ed-96ab-4bda625ca93a' },
      });

      const area = await this.areaRepository.findOne({
        where: { id: '3bb02804-9d93-11ed-8c7e-a453eed313a7' },
      });

      for (let index = 1; index <= 50; index++) {
        const lugar = this.lugarRepository.create({
          numero: index,
          area,
          plaza,
        });

        await this.lugarRepository.save(lugar);
      }

      return 'OK';
    } catch (error) {
      return error;
    }
  }

  async validateInscription(user: Usuario) {
    try {
      const { matricula } = user;
      const event = await this.usuarioEventoRepository
        .createQueryBuilder('usuario_evento')
        .select(['usuario_evento.fechaInscripcion'])
        .innerJoin('usuario_evento.evento', 'evento')
        .innerJoin('usuario_evento.usuario', 'usuario')
        .where('usuario.matricula =:matricula', { matricula })
        .andWhere('evento.activo = 1')
        .groupBy('usuario_evento.fechaInscripcion')
        .getRawOne();

      const currentDate = new Date();
      const finalDate = new Date();
      finalDate.setDate(event.usuario_evento_fechaInscripcion.getDate());
      finalDate.setHours(12);

      if (
        event.usuario_evento_fechaInscripcion.getTime() <=
          currentDate.getTime() && // ){
        event.usuario_evento_fechaInscripcion.getTime() >= finalDate.getTime()
      ) {
        return {
          status: 'OK',
        };
      }

      throw new ForbiddenException('No es hora.');
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getEvents(user: Usuario) {
    logStandar('OBTENIENDO EVENTO DEL USUARIO', '-', ValidLogTypes.log);

    try {
      const pre_events = await this.usuarioEventoRepository.findOne({
        where: {
          evento: {
            activo: 1,
          },
          usuario: {
            matricula: user.matricula,
          },
        },
      });

      if (!pre_events) {
        throw new NotFoundException(
          'No hay evento registrado para este usuario',
        );
      }

      let numberLugar = null;

      if (pre_events.lugar) numberLugar = pre_events.lugar.numero;

      const fechaInscripcionParse =
        pre_events.fechaInscripcion.toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });

      const events = {
        usuario_evento_inscrito: pre_events.inscrito,
        usuario_evento_fechaInscripcion: fechaInscripcionParse,
        evento_nombre: pre_events.evento.nombre,
        evento_semana: pre_events.evento.semana,
        evento_hora: pre_events.evento.hora,
        evento_fechaInicio: pre_events.evento.fechaInicio,
        evento_fechaFin: pre_events.evento.fechaInicio,
        lugar_numero: `${numberLugar}${pre_events.usuario.area.nombre[0]}`,
        plaza_nombre: pre_events.evento.plaza.nombre,
      };

      const response: IResponse = {
        status: 'OK',
        message: 'Esta inscrito',
        data: events,
      };

      return response;
    } catch (error) {
      Logger.error(`Internal server error: ${error}`);
      const response: IResponse = {
        status: 'FAIL',
        message: error.message,
        data: null,
      };
      return response;
    } finally {
      logStandar();
    }
  }

  async createEvent(createEventoDto: CreateEventoDto) {
    logStandar('CREANDO EVENTO', '-', ValidLogTypes.log);

    //apgar el restp de eventos antes de crear este, validar que el evento a crear no exista ya
    const { nombre, fechaInicio, fechaFin, fechaInscripcion, plaza, hora } =
      createEventoDto;

    const _fechaInicio = new Date(fechaInicio);
    const _fechaFin = new Date(fechaFin);
    const _fechaInscripcionTmp = new Date(fechaInscripcion);
    const _fechaDias = this.getDaysDiff(_fechaFin, _fechaInicio);

    const semana = `Semana ${this.getWeek(_fechaInicio)}`;

    try {
      const _evento = await this.eventoRepository.findOne({
        where: {
          nombre,
          semana,
        },
      });

      if (_evento) {
        throw new BadRequestException(
          `Este evento ya se encuentra registrado.`,
        );
      }

      Logger.log(`Buscando plaza con id: ${plaza}`);
      const _plaza = await this.plazaRepository.findOne({
        where: { id: plaza },
      });

      if (!_plaza) {
        throw new NotFoundException(`No se encontro la plaza con id: ${plaza}`);
      }

      Logger.log(`Buscando eventos activos.`);
      const _eventosActivos = await this.eventoRepository.find({
        where: {
          activo: 1,
        },
      });

      Logger.log(`Apagando eventos activos`);
      _eventosActivos.map((evento) => {
        evento.activo = 0;
        return evento;
      });

      Logger.log(`Guardando en base de datos`);
      await this.eventoRepository.save(_eventosActivos);

      Logger.log(`Creando evento. ===> ${nombre} ${semana}`);
      const evento = this.eventoRepository.create({
        nombre,
        semana,
        fechaInicio: _fechaInicio,
        fechaFin: _fechaFin,
        plaza: _plaza,
        hora,
      });

      Logger.log(`Guardando evento en base de datos. ===> ${nombre} ${semana}`);
      await this.eventoRepository.save(evento);

      Logger.log(`Obteniendo todos los usuarios para inscripción.`);
      const users = await this.usuarioRepository.find({
        where: {
          activo: true,
          rol: {
            nombre: 'Usuario',
          },
        },
        order: {
          puntos: 'DESC',
        },
      });

      if (!users) {
        throw new NotFoundException(
          'No se encontraron usuarios para inscribir.',
        );
      }

      const usuarios_eventos: Array<UsuarioEvento> = [];

      Logger.log(`Inscribiendo usarios en fecha inicio hasta fecha fin.`);
      for (let index = 0; index <= _fechaDias; index++) {
        let dia = new Date(_fechaInicio);
        dia.setDate(_fechaInicio.getDate() + (index + 1));

        const nameDay = this.getNameOfDayOfWeek(dia);

        Logger.log(`Inscribiendo usarios para el dia ${nameDay}. ===> ${dia}`);
        users.map((usuario, i) => {
          const _fechaInscripcion = new Date(fechaInscripcion);

          if (i >= 0 && i <= 20) _fechaInscripcion.setHours(6);
          else if (i > 10 && i <= 40) _fechaInscripcion.setHours(7);
          else if (i > 40 && i <= 60) _fechaInscripcion.setHours(8);
          else if (i > 60 && i <= 80) _fechaInscripcion.setHours(9);
          else _fechaInscripcion.setHours(10);

          _fechaInscripcion.setDate(_fechaInscripcionTmp.getDate());

          Logger.log(
            `Inscribiendo | ${usuario.matricula} | ${nameDay} | ${_fechaInscripcion}`,
          );

          const usuario_evento = this.usuarioEventoRepository.create({
            dia: nameDay,
            fechaInscripcion: _fechaInscripcion,
            usuario,
            evento,
          });

          usuarios_eventos.push(usuario_evento);
        });
      }

      Logger.log(`Guardando inscripciones en base de datos.`);
      await this.usuarioEventoRepository.save(usuarios_eventos);

      const response: IResponse = {
        status: 'OK',
        message:
          'Evento creado con exito | Inscripciones registradas con exito.',
        data: usuarios_eventos,
      };
      return response;
    } catch (error) {
      const response: IResponse = {
        status: 'FAIL',
        message: error.message,
        data: null,
      };
      Logger.error(error);
      return response;
    } finally {
      logStandar();
    }
  }

  async setLugar(usuario: Usuario, setLugar: SetLugarDto) {
    try {
      const { fk_lugar } = setLugar;

      const lugar = await this.lugarRepository.findOne({
        where: { id: fk_lugar },
      });

      if (!lugar)
        return {
          status: 'FAIL',
          message: 'No se encontro el lugar seleccionado.',
          lugar: null,
        };

      if (lugar.ocupado === 1)
        return {
          status: 'FAIL',
          message: 'El lugar ya esta ocupado.',
          lugar: null,
        };

      lugar.ocupado = 1;

      const evento = await this.eventoRepository.findOne({
        where: { activo: 1 },
      });

      const usuario_evento = await this.usuarioEventoRepository.find({
        where: { evento: { id: evento.id }, usuario: { id: usuario.id } },
      });

      if (usuario_evento[0].inscrito === 1)
        return {
          status: 'FAIL',
          message: 'Usted ya esta inscrito.',
          lugar: null,
        };

      usuario_evento.map((evento) => {
        evento.lugar = lugar;
        evento.inscrito = 1;
      });

      await this.usuarioEventoRepository.save(usuario_evento);

      return {
        status: 'OK',
        message: 'Se reservo el lugar con éxito.',
        lugar: `${lugar.numero}${lugar.area.nombre[0]}`,
      };
    } catch (error) {}
  }

  getWeek(eventDate: Date) {
    const oneJan = new Date(eventDate.getFullYear(), 0, 1);
    const numberOfDays = Math.floor(
      (Number(eventDate) - Number(oneJan)) / (24 * 60 * 60 * 1000),
    );
    const week = Math.ceil((eventDate.getDay() + 1 + numberOfDays) / 7);

    return week;
  }

  getDaysDiff(fechaInicio: Date, fechaFin: Date) {
    const diferencia = fechaInicio.getTime() - fechaFin.getTime();
    const diasDeDiferencia = diferencia / 1000 / 60 / 60 / 24;

    return diasDeDiferencia;
  }

  getNameOfDayOfWeek(fecha: Date) {
    let dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miercoles',
      'Jueves',
      'Viernes',
      'Sabado',
    ];
    return dias[fecha.getDay()];
  }

  async getExcelList(excelListDto: ExcelListDto) {
    try {
      const users_events = await this.usuarioEventoRepository.find({
        where: {
          evento: {
            id: excelListDto.fk_evento,
          },
          inscrito: 1,
        },
        order: {
          usuario: {
            matricula: 'ASC',
            area: {
              nombre: 'ASC',
            },
          },
        },
      });

      const list = users_events.map((user_event) => {
        return {
          Matricula: user_event.usuario.matricula,
          Area: user_event.usuario.area.nombre,
          Asiento: `${user_event.lugar.numero}${user_event.usuario.area.nombre[0]}`,
          Nombre: user_event.usuario.nombre,
          Apellido_paterno: user_event.usuario.apellido_paterno,
          Apellido_materno: user_event.usuario.apellido_materno,
          Fecha_evento: user_event.dia,
          Puntos: user_event.puntos > 0 ? user_event.puntos : null,
        };
      });

      let rows = [];

      list.forEach((doc) => {
        rows.push(Object.values(doc));
      });

      let book = new Workbook();

      let sheet = book.addWorksheet(`CG`);

      rows.unshift(Object.keys(list[0]));

      sheet.addRows(rows);

      this.styleSheet(sheet);

      let File = await new Promise((resolve, reject) => {
        tmp.file(
          {
            discardDescriptor: true,
            prefix: `CorredorGastronomico`,
            postfix: `.xlsx`,
            mode: parseInt('0600', 8),
          },
          async (err, file) => {
            if (err) throw new BadRequestException(err);

            book.xlsx
              .writeFile(file)
              .then((_) => {
                resolve(file);
              })
              .catch((error) => {
                throw new BadRequestException(error);
              });
          },
        );
      });

      return File;
    } catch (error) {}
  }

  async getActiveEvents() {
    try {
      const events = await this.eventoRepository.find({ where: { activo: 1 } });

      const eventList = events.map((event) => {
        return {
          id: event.id,
          nombre: `${event.nombre} ${
            event.semana
          } | ${event.fechaInicio.toLocaleDateString(
            'en-GB',
          )} - ${event.fechaFin.toLocaleDateString('en-GB')}`,
        };
      });
      return eventList;
    } catch (error) {}
  }

  async setExcelList(file: Express.Multer.File, excelListDto: string) {
    try {
      let workBook = new Workbook();
      await workBook.xlsx.load(file.buffer);

      // data
      let excelTitles = [];
      let excelData = [];

      // excel to json converter (only the first sheet)
      workBook.worksheets[0].eachRow((row, rowNumber) => {
        // rowNumber 0 is empty
        if (rowNumber > 0) {
          // get values from row
          let rowValues;
          rowValues = row.values;
          // remove first element (extra without reason)
          rowValues.shift();
          // titles row
          if (rowNumber === 1) excelTitles = rowValues;
          // table data
          else {
            // create object with the titles and the row values (if any)
            let rowObject = {};
            for (let i = 0; i < excelTitles.length; i++) {
              let title = excelTitles[i];
              let value = rowValues[i] ? rowValues[i] : '';
              rowObject[title] = value;
            }
            excelData.push(rowObject);
          }
        }
      });

      const eventos_usuarios = await Promise.all(
        excelData.map(async (data) => {
          const usuario_evento = await this.usuarioEventoRepository.findOne({
            where: {
              usuario: {
                matricula: data.Matricula,
                area: {
                  nombre: data.Area,
                },
              },
              evento: {
                id: excelListDto,
              },
              dia: data.Fecha_evento,
            },
          });
          usuario_evento.puntos =
            Number(data.Puntos) > 1000
              ? Number(data.Puntos)
              : usuario_evento.puntos;
          usuario_evento.modificado_en = new Date();

          return usuario_evento;
        }),
      );

      await this.usuarioEventoRepository.save(eventos_usuarios);

      const allUsers = await this.usuarioRepository.find({
        where: { rol: { nombre: 'Usuario' }, activo: true },
      });
      const usersPoints = await Promise.all(
        allUsers.map(async (user) => {
          const userPoints = await this.usuarioEventoRepository
            .createQueryBuilder('usuario_evento')
            .select(['usuario_evento.puntos'])
            .innerJoin('usuario_evento.usuario', 'usuario')
            .innerJoin('usuario.rol', 'rol')
            .where('usuario.matricula =:matricula', {
              matricula: user.matricula,
            })
            .andWhere('usuario_evento.inscrito = 1')
            .getMany();

          let sumaPuntos = 0;
          userPoints.map(({ puntos }) => {
            sumaPuntos += puntos;
          });

          const promedio = sumaPuntos / userPoints.length;

          if (promedio > 1000) {
            user.puntos = promedio;
          }

          return user;
        }),
      );

      await this.usuarioRepository.save(usersPoints);

      return usersPoints;
    } catch (error) {
      console.log(error);
    }
  }

  private styleSheet(sheet: Worksheet) {
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '9D2449' },
    };

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

    sheet.autoFilter = 'A1:H1';
  }

  async getUserHistory(matricula: string) {
    try {
      if (matricula === '' || !matricula || matricula == undefined)
        throw new BadRequestException('No contiene la matricula del usuario');

      const usuario = await this.usuarioRepository.findOne({
        where: { matricula },
      });

      if (!usuario)
        return {
          status: 'FAIL',
          message: 'Este usuario no existe.',
          historyFinal: null,
        };

      const history = await this.usuarioEventoRepository.find({
        where: {
          usuario: {
            matricula,
          },
          inscrito: 1,
        },
      });

      if (!history)
        return {
          status: 'OK',
          message: 'Este usuario no cuenta con historico.',
          historyFinal: null,
        };

      const historyFinal = await Promise.all(
        history.map(async (event) => {
          const { puntos, dia, evento, lugar, usuario } = event;
          return {
            puntos,
            dia,
            nombreEvento: `${evento.nombre} ${evento.semana}`,
            nombrePlaza: evento.plaza.nombre,
            numeroLugar: `${lugar.numero}${usuario.area.nombre[0]}`,
            fechaInicio: evento.fechaInicio.toLocaleDateString(),
            fechaFin: evento.fechaFin.toLocaleDateString(),
          };
        }),
      );

      return {
        status: 'OK',
        message: 'Se extrajo el historico correctamente.',
        historyFinal,
      };
    } catch (error) {
      return error;
    }
  }
}
