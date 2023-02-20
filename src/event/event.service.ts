import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lugar, Plaza, Evento } from './entities';
import { Repository } from 'typeorm';
import { Area } from 'src/auth/entities';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common/exceptions';
import { CreateEventoDto } from './dto/create-evento.dto';
import { Usuario } from '../auth/entities/usuario.entity';
import { UsuarioEvento } from './entities/usuario-evento.entity';
import { SetLugarDto } from './dto/set-lugar.dto';
@Injectable()
export class EventService {

  constructor (
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
    private readonly usuarioEventoRepository: Repository<UsuarioEvento>
  ){}

  async getLugares(user: Usuario) {
    try {
      const lugares = await this.lugarRepository.createQueryBuilder('lugar')
      .select([
        'lugar.id',
        'lugar.numero',
        'area.nombre'
      ])
      .where('lugar.ocupado = 0')
      .andWhere('area.nombre =:nombreArea', {nombreArea: user.area.nombre})
      .innerJoin('lugar.area', 'area')
      .orderBy('lugar.numero')
      .getRawMany()

      return lugares
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async generarLugares() {
    try {
      const plaza = await this.plazaRepository.findOne({where: {id: 'e7f146b6-a8bb-11ed-96ab-4bda625ca93a'}})

      const area = await this.areaRepository.findOne({where:{id:'3bb02804-9d93-11ed-8c7e-a453eed313a7'}})

      for (let index = 1; index <= 50; index++) {
        const lugar = this.lugarRepository.create({
          numero: index,
          area,
          plaza
        })
        
        await this.lugarRepository.save(lugar)
      }

      return "OK"
    } catch (error) {
      return error
    }
  }

  async validateInscription(user : Usuario) {
    try {

      const { matricula } = user
      const event = await this.usuarioEventoRepository.createQueryBuilder('usuario_evento')
      .select([
        'usuario_evento.fechaInscripcion'
      ])
      .innerJoin('usuario_evento.evento', 'evento')
      .innerJoin('usuario_evento.usuario', 'usuario')
      .where('usuario.matricula =:matricula', {matricula})
      .andWhere('evento.activo = 1')
      .groupBy('usuario_evento.fechaInscripcion')
      .getRawOne()

      const currentDate = new Date()
      const finalDate = new Date()
      finalDate.setDate(event.usuario_evento_fechaInscripcion.getDate())
      finalDate.setHours(12)

      if( event.usuario_evento_fechaInscripcion.getTime() <= currentDate.getTime() ){
        //&&  event.usuario_evento_fechaInscripcion.getTime() >= finalDate.getTime())

        return {
          status: "OK"
        }

      }

      throw new ForbiddenException("No es hora.") 

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async getEvents(user: any) {

    try {
      const pre_events = await this.usuarioEventoRepository.findOneOrFail({

        where: {
          evento : {
            activo: 1,
          },
          usuario : {
            matricula : user.matricula
          }
        }
      })

      let numberLugar = null
      console.log(pre_events.lugar)
      if( pre_events.lugar )
        numberLugar = pre_events.lugar.numero

      const fechaInscripcionParse = pre_events.fechaInscripcion.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
      // return pre_events

      const events = {
        usuario_evento_inscrito:         pre_events.inscrito,
        usuario_evento_fechaInscripcion: fechaInscripcionParse,
        evento_nombre:                   pre_events.evento.nombre,
        evento_semana:                   pre_events.evento.semana,
        evento_hora:                     pre_events.evento.hora,
        evento_fechaInicio:              pre_events.evento.fechaInicio,
        evento_fechaFin:                 pre_events.evento.fechaInicio,
        lugar_numero:                    `${numberLugar}${pre_events.usuario.area.nombre[0]}`,
        plaza_nombre:                    pre_events.evento.plaza.nombre,
      }

      return events
      // const events = await this.usuarioEventoRepository.createQueryBuilder("usuario_evento")
      // .select([
      //   'usuario_evento.inscrito',
      //   'usuario_evento.fechaInscripcion',
      //   'evento.nombre',
      //   'evento.semana',
      //   'evento.fechaInicio',
      //   'evento.fechaFin',
      //   'evento.hora',
      //   'lugar.numero',
      //   'plaza.nombre'
      // ])
      // .innerJoin("usuario_evento.evento", "evento")
      // .innerJoin('usuario_evento.usuario', 'usuario')
      // .innerJoin('usuario_evento.lugar', 'lugar')
      // .innerJoin('evento.plaza', 'plaza')
      // .where("evento.activo = 1")
      // .andWhere('usuario.matricula =:matricula', {matricula: user.matricula})
      // .groupBy("evento.nombre")
      // .addGroupBy("evento.semana")
      // .addGroupBy("evento.fechaInicio")
      // .addGroupBy("evento.fechaFin")
      // .addGroupBy("evento.hora")
      // .addGroupBy("usuario_evento.inscrito")
      // .addGroupBy("usuario_evento.fechaInscripcion")
      // .addGroupBy("plaza.nombre")
      // .addGroupBy("lugar.numero")
      // .getRawOne();

      // const { usuario_evento_fechaInscripcion } = events

      // const fechaInscripcion:Date = usuario_evento_fechaInscripcion
      // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

      // const fechaInscripcionParse = fechaInscripcion.toLocaleDateString('es-MX', {
      //   weekday: 'long',
      //   year: 'numeric',
      //   month: 'long',
      //   day: 'numeric',
      //   hour: 'numeric',
      //   minute: 'numeric'
      // })

      // return {
      //   ...events,
      //   usuario_evento_fechaInscripcion: fechaInscripcionParse
      // }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async createEvent(createEventoDto: CreateEventoDto) {
    
    //Creamos el evento
    const { nombre, fechaInicio, fechaFin, fechaInscripcion, plaza, hora } = createEventoDto;
    
    const _fechaInicio = new Date(fechaInicio)
    const _fechaFin= new Date(fechaFin)
    const _fechaInscripcionTmp = new Date(fechaInscripcion)
    const _fechaDias = this.getDaysDiff(_fechaFin, _fechaInicio)

    try {
      
      const _plaza = await this.plazaRepository.findOne({where: {id: plaza}})
      
      const evento = this.eventoRepository.create({
        nombre,
        semana: `Semana ${this.getWeek(_fechaInicio)}`,
        fechaInicio: _fechaInicio,
        fechaFin: _fechaFin,
        plaza: _plaza,
        hora
      })

      await this.eventoRepository.save(evento)

      //Registramos a todos los usuarios en el evento
      const users = await this.usuarioRepository.find({
        order:{
          puntos: "DESC"
        }
      })

      const usuarios_eventos:Array<UsuarioEvento> = []

      for (let index = 0; index <= _fechaDias; index++) {

        let dia = new Date(_fechaInicio)
        dia.setDate(_fechaInicio.getDate() + (index + 1))

        const nameDay = this.getNameOfDayOfWeek(dia)
        users.map( (usuario, i) => {

          const _fechaInscripcion = new Date(fechaInscripcion)

          if( i >= 0 && i <= 10)
            _fechaInscripcion.setHours(2)
          else if( i > 10 && i <= 20 )
            _fechaInscripcion.setHours(3)
          else
            _fechaInscripcion.setHours(4)

          _fechaInscripcion.setDate(_fechaInscripcionTmp.getDate())

          console.log(_fechaInscripcion)
          const usuario_evento = this.usuarioEventoRepository.create({
            dia: nameDay,
            fechaInscripcion: _fechaInscripcion,
            usuario,
            evento
          })
  
          usuarios_eventos.push(usuario_evento)
        })
        
      }

      await this.usuarioEventoRepository.save(usuarios_eventos)

      return usuarios_eventos

    } catch (error) {
      
    }
  }

  async setLugar(usuario: Usuario, setLugar: SetLugarDto) {
    try {
      const { fk_lugar } = setLugar

      const lugar = await this.lugarRepository.findOne({where : {id: fk_lugar}})

      if(!lugar)
        return{
          status: "FAIL",
          message: "No se encontro el lugar seleccionado.",
          lugar: null
        }

      if( lugar.ocupado === 1 )
        return {
          status: "FAIL",
          message: "El lugar ya esta ocupado.",
          lugar: null
        }

      lugar.ocupado = 1;

      const evento = await this.eventoRepository.findOne({where: {activo: 1}})

      const usuario_evento = await this.usuarioEventoRepository.find({ where: { evento: { id: evento.id }, usuario : {id: usuario.id} } })

      if( usuario_evento[0].inscrito === 1)
        return {
          status: "FAIL",
          message: "Usted ya esta inscrito.",
          lugar: null
        }

      usuario_evento.map((evento) => {
        evento.lugar = lugar
        evento.inscrito = 1
      }) 

      await this.usuarioEventoRepository.save(usuario_evento)

      return {
        status: "OK",
        message: "Se reservo el lugar con éxito.",
        lugar: `${lugar.numero}${lugar.area.nombre[0]}`
      }

    } catch (error) {
      
    }
  }


  getWeek(eventDate: Date) {

    const oneJan = new Date(eventDate.getFullYear(),0,1)
    const numberOfDays = Math.floor((Number(eventDate) - Number(oneJan)) / (24 * 60 * 60 * 1000) )
    const week = Math.ceil((eventDate.getDay() + 1 + numberOfDays) / 7)

    return week

  }

  getDaysDiff(fechaInicio: Date, fechaFin: Date){

    const diferencia = fechaInicio.getTime() - fechaFin.getTime()
    const diasDeDiferencia = diferencia / 1000 / 60 / 60 / 24;

    return diasDeDiferencia
  }

  getNameOfDayOfWeek(fecha: Date){
    let dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    return dias[fecha.getDay()]
  }

}
