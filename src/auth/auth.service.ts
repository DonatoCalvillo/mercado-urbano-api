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

  async getAllUsers(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    const usuarios =  await this.useRepository.find({
      take: limit,
      skip: offset,
      relations: {
        area: true,
        rol: true
      }
    })

    return usuarios.map( usuario =>{
        
    })
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const { contrasenia, fk_rol, fk_area, ...userData } = createUsuarioDto

      const rol = await this.rolRepository.findOne({where: {id: fk_rol}})

      const area = await this.areaRepository.findOne({where: {id: fk_area}})

      const user = this.useRepository.create({
        ...userData,
        contrasenia: bcrypt.hashSync( contrasenia, 10 ),
        rol,
        area
      })

      await this.useRepository.save( user )

      delete user.contrasenia

      return {
        ...user,
        token: this.getJwtToken({ matricula: user.matricula })
      }

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
      usuario : final_user,
      token: this.getJwtToken({ matricula: user.matricula })
    };

  }

  private getJwtToken( payload: IJwtPayload ) {
    const token = this.jwtService.sign( payload )
    return token
  }

  private handleDBErrors ( error: any ): never {
    if(error.originalError.info.number == 2627)
      throw new BadRequestException( error.originalError.info.message )

    console.log(  error.originalError ) 

    throw new InternalServerErrorException("Favor de revisar los logs del API")
  }

}
