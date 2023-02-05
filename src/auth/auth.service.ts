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

import { IJwtPayload } from './interfaces/jwt-payload.interface';
// import {  } from './entities/area.entity';
import { IResponseLogin } from './interfaces/response.interface';

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
      const { contrasenia, fk_rol, fk_area, ...userData } = createUsuarioDto

      const emailVerify = await this.useRepository.findOne({where: {correo: userData.correo}})

      if ( emailVerify )
        throw new BadRequestException("Correo ya registrado.")

      const rol = await this.rolRepository.findOne({where: {nombre: fk_rol}})

      const area = await this.areaRepository.findOne({where: {nombre: fk_area}})

      //Armar matricula
      const secuencia = await this.useRepository.query(`SELECT COUNT(1) AS secuencia FROM usuario WHERE fk_area='${area.id}'`)

      const secuenciaNumeric = Number(secuencia[0].secuencia) + 1
      
      const matricula = this.generateMatricula(secuenciaNumeric.toString(), area.nombre)
      
      //to do, recibir y validar jwt que sea admin
      const user = this.useRepository.create({
        ...userData,
        contrasenia: bcrypt.hashSync( contrasenia, 10 ),
        rol,
        area,
        matricula
      })

      await this.useRepository.save( user )

      delete user.contrasenia

      const response : IResponseLogin = {
        message: "Usuario creado exitosamente.",
        user
        // token: this.getJwtToken({ matricula: user.matricula })
      } 

      return response

    } catch (error) {
      this.handleDBErrors( error )
    }
  }

  async login ( loginUsuarioDto: LoginUsuarioDto ) {

    const { contrasenia, matricula } = loginUsuarioDto

    const user = await this.useRepository.findOneBy({matricula})
    
    if( !user || !bcrypt.compareSync( contrasenia, user.contrasenia ) )
      throw new UnauthorizedException("Credenciales invalidas.")

    const { nombre, apellido_paterno, apellido_materno, rol } = user
    const rol_nombre = rol.nombre

    const final_user = {
      matricula,
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

  async validateToken (token = '') {
    return token
  }

  private getJwtToken( payload: IJwtPayload ) {
    const token = this.jwtService.sign( payload )
    return token
  }

  private handleDBErrors ( error: any ): never {
    // if(error.originalError.info.number == 2627)
    //   throw new BadRequestException( error.originalError.info.message )

    console.log( error.sqlMessage ) 

    throw new InternalServerErrorException( error.sqlMessage )
  }

  private generateMatricula = (secuencia:string, area:string): string => {
    const number = secuencia.padStart(3,'0')

    return `CAR${number}-${area[0]}`
  }

}
