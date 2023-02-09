import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';

import { CreateUsuarioDto, LoginUsuarioDto } from './dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Usuario, Rol, Area } from './entities';

import { IJwtPayload, IResponseLogin } from './interfaces';


@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(Usuario)
    private readonly useRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    private readonly jwtService: JwtService
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const { contrasenia, fk_area, ...userData } = createUsuarioDto

      const emailVerify = await this.useRepository.findOne({where: {correo: userData.correo}})
      console.log(emailVerify)
      if ( emailVerify )
        return new BadRequestException("Correo ya registrado.")

      const rol = await this.rolRepository.findOne({where: {nombre: 'Usuario'}})
      console.log(rol)
      const area = await this.areaRepository.findOne({where: {nombre: fk_area}})

      //Armar matricula
      const secuencia = await this.useRepository.query(`SELECT COUNT(1) AS secuencia FROM usuario WHERE fk_area='${area.id}'`)

      const secuenciaNumeric = Number(secuencia[0].secuencia) + 1
      
      const matricula = this.generateMatricula(secuenciaNumeric.toString(), area.nombre)
      
      const user = this.useRepository.create({
        ...userData,
        contrasenia: bcrypt.hashSync( contrasenia, 10 ),
        rol,
        area,
        matricula
      })

      await this.useRepository.save( user )

      delete user.contrasenia

      const newUser = {
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        matricula: user.matricula,
        correo: user.correo,
        telefono: user.telefono,
        area: user.area.nombre
      }

      return {
        message: "Usuario creado exitosamente.",
        newUser
      } 

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async login ( loginUsuarioDto: LoginUsuarioDto ) {

    const { contrasenia, matricula } = loginUsuarioDto

    const user = await this.useRepository.createQueryBuilder("usuario")
      .select([
        'usuario.matricula',
        'usuario.puntos',
        'usuario.nombre',
        'usuario.contrasenia',
        'usuario.apellido_paterno',
        'usuario.apellido_materno',
        'rol.nombre',
      ])
      .innerJoin("usuario.rol", "rol")
      .where("usuario.matricula =:matricula", {matricula})
      .andWhere("rol.nombre =:nombre", {nombre: "Usuario"})
      .getOne()
    
    if( !user || !bcrypt.compareSync( contrasenia, user.contrasenia ) )
      throw new UnauthorizedException("Credenciales invalidas.")

    const { nombre, apellido_paterno, apellido_materno, rol, puntos } = user
    const rol_nombre = rol.nombre

    const final_user = {
      matricula,
      puntos,
      nombre,
      apellido_paterno,
      apellido_materno,
      rol_nombre,
    }

    return {
      menssage: "Acceso exitoso.",
      usuario : final_user,
      token: this.getJwtToken({ matricula: user.matricula })
    };

  }

  async loginAdmin ( loginUsuarioDto: LoginUsuarioDto ) {

    const { contrasenia, matricula } = loginUsuarioDto

    const user = await this.useRepository.createQueryBuilder("usuario")
      .select([
        'usuario.matricula',
        'usuario.puntos',
        'usuario.nombre',
        'usuario.contrasenia',
        'usuario.apellido_paterno',
        'usuario.apellido_materno',
        'rol.nombre',
      ])
      .innerJoin("usuario.rol", "rol")
      .where("usuario.matricula =:matricula", {matricula})
      .andWhere("rol.nombre in (:rolUno , :rolDos)", {rolUno: "Administrador", rolDos: "SuperAdministrador"})
      .getOne()
    
    if( !user || !bcrypt.compareSync( contrasenia, user.contrasenia ) )
      throw new UnauthorizedException("Credenciales invalidas.")

    const { nombre, apellido_paterno, apellido_materno, rol, puntos } = user
    const rol_nombre = rol.nombre

    const final_user = {
      matricula,
      puntos,
      nombre,
      apellido_paterno,
      apellido_materno,
      rol_nombre,
    }

    return {
      menssage: "Acceso exitoso.",
      usuario : final_user,
      token: this.getJwtToken({ matricula: user.matricula })
    };

  }



  async validateToken ( user: Usuario) {
    const finalUser = {
      matricula: user.matricula,
      puntos: user.puntos,
      nombre: user.nombre,
      apellido_paterno: user.apellido_paterno,
      apellido_materno: user.apellido_materno,
      rol_nombre: user.rol.nombre
    }

    return {
      usuario: finalUser,
      token: this.getJwtToken({ matricula: user.matricula })
    }
  }

  private getJwtToken( payload: IJwtPayload ) {
    const token = this.jwtService.sign( payload )
    return token
  }

  private handleDBErrors ( error: any ) {

    console.log( error.sqlMessage ) 

    return new InternalServerErrorException( error.sqlMessage )
  }

  private generateMatricula = (secuencia:string, _area:string): string => {
    const number = secuencia.padStart(3,'0')

    const area = _area.toUpperCase()
    if( area === "ADMINISTRADOR" )
      return `CAR${number}-ADM`

    return `CAR${number}-${area[0]}`
  }
}
