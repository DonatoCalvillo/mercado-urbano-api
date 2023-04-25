import { Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

import { generate } from 'generate-password';

import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';

import { CreateUsuarioDto, LoginUsuarioDto } from './dto';

import { Usuario, Rol, Area } from './entities';

import { IJwtPayload } from './interfaces';
import { ValidLogTypes, logStandar } from 'src/helper/logStandar';
import { IResponse } from 'src/interface/response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly useRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    logStandar('CREANDO USUARIO', '-', ValidLogTypes.log);

    try {
      const {
        contrasenia = generate({
          length: 10,
          numbers: true,
          uppercase: true,
          lowercase: true,
          symbols: true,
        }),
        fk_area,
        fk_rol,
        ...userData
      } = createUsuarioDto;

      Logger.log(`Verificando correo: ${userData.correo}`);
      const emailVerify = await this.useRepository.findOne({
        where: { correo: userData.correo },
      });

      if (emailVerify) throw new BadRequestException(`Correo ya registrado.`);

      Logger.log(`Verificando rol: ${fk_rol}`);
      const rol = await this.rolRepository.findOne({
        where: { nombre: fk_rol },
      });

      if (!rol) throw new BadRequestException(`Rol inexistente: Usuario`);

      const area = await this.areaRepository.findOne({
        where: { nombre: fk_area },
      });

      if (!area)
        throw new BadRequestException(`Area inexistente id: ${fk_area}`);

      Logger.log('Generando matricula nueva...');
      const secuencia = await this.useRepository.query(
        `SELECT COUNT(1) AS secuencia FROM usuario WHERE fk_area='${area.id}'`,
      );

      const secuenciaNumeric = Number(secuencia[0].secuencia) + 1;

      const matricula = this.generateMatricula(
        secuenciaNumeric.toString(),
        area.nombre,
      );
      Logger.log(`Matricula nueva generada: ${matricula}`);

      Logger.log(`Creando usuario con matricula: ${matricula}`);
      const user = this.useRepository.create({
        ...userData,
        contrasenia: bcrypt.hashSync(contrasenia, 10),
        rol,
        area,
        matricula,
      });

      Logger.log(`Guardando usuario en base de datos. ===> ${matricula}`);
      await this.useRepository.save(user);

      const newUser = {
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        matricula: user.matricula,
        contrasenia,
        correo: user.correo,
        telefono: user.telefono,
        area: user.area.nombre,
      };

      Logger.log(`Usuario creado exitosamente. ===> ${matricula}`);

      const response: IResponse = {
        status: 'OK',
        message: 'Usuario creado exitosamente.',
        data: newUser,
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

  async login(loginUsuarioDto: LoginUsuarioDto) {
    logStandar('LOGIN', '-', ValidLogTypes.log);

    const { contrasenia, matricula } = loginUsuarioDto;

    Logger.log(`Verificando usuario. ===> ${matricula}`);

    try {
      const user = await this.useRepository
        .createQueryBuilder('usuario')
        .select([
          'usuario.matricula',
          'usuario.puntos',
          'usuario.nombre',
          'usuario.contrasenia',
          'usuario.apellido_paterno',
          'usuario.apellido_materno',
          'rol.nombre',
          'area.nombre',
        ])
        .innerJoin('usuario.rol', 'rol')
        .innerJoin('usuario.area', 'area')
        .where('usuario.matricula =:matricula', { matricula })
        .andWhere('rol.nombre =:nombre', { nombre: 'Usuario' })
        .getOne();

      if (!user || !bcrypt.compareSync(contrasenia, user.contrasenia)) {
        throw new UnauthorizedException(`Credenciales invalidas.`);
      }

      const { area, nombre, apellido_paterno, apellido_materno, rol, puntos } =
        user;

      const rol_nombre = rol.nombre;

      const final_user = {
        matricula,
        puntos,
        nombre,
        apellido_paterno,
        apellido_materno,
        rol_nombre,
        area: area.nombre,
      };

      Logger.log(`Acceso verificado correctamente. ===> ${matricula}`);

      const response: IResponse = {
        status: 'OK',
        message: 'Acceso de usuario exitoso.',
        data: final_user,
        token: this.getJwtToken({ matricula: user.matricula }),
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

  async loginAdmin(loginUsuarioDto: LoginUsuarioDto) {
    logStandar('ADMIN LOGIN', '-', ValidLogTypes.log);

    const { contrasenia, matricula } = loginUsuarioDto;
    Logger.log(`Verificando administrador. ===> ${matricula}`);

    try {
      const user = await this.useRepository
        .createQueryBuilder('usuario')
        .select([
          'usuario.matricula',
          'usuario.puntos',
          'usuario.nombre',
          'usuario.contrasenia',
          'usuario.apellido_paterno',
          'usuario.apellido_materno',
          'rol.nombre',
        ])
        .innerJoin('usuario.rol', 'rol')
        .where('usuario.matricula =:matricula', { matricula })
        .andWhere('rol.nombre in (:rolUno , :rolDos)', {
          rolUno: 'Administrador',
          rolDos: 'SuperAdministrador',
        })
        .getOne();

      if (!user || !bcrypt.compareSync(contrasenia, user.contrasenia))
        throw new UnauthorizedException('Credenciales invalidas.');

      const { nombre, apellido_paterno, apellido_materno, rol, puntos } = user;
      const rol_nombre = rol.nombre;

      const final_user = {
        matricula,
        puntos,
        nombre,
        apellido_paterno,
        apellido_materno,
        rol_nombre,
      };

      Logger.log(
        `Acceso administrador verificado correctamente. ===> ${matricula}`,
      );

      const response: IResponse = {
        status: 'OK',
        message: 'Acceso de administrador exitoso.',
        data: final_user,
        token: this.getJwtToken({ matricula: user.matricula }),
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

  async validateToken(user: Usuario) {
    const finalUser = {
      matricula: user.matricula,
      puntos: user.puntos,
      nombre: user.nombre,
      apellido_paterno: user.apellido_paterno,
      apellido_materno: user.apellido_materno,
      rol_nombre: user.rol.nombre,
      area: user.area.nombre,
    };

    return {
      usuario: finalUser,
      token: this.getJwtToken({ matricula: user.matricula }),
    };
  }

  private getJwtToken(payload: IJwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private generateMatricula = (secuencia: string, _area: string): string => {
    const number = secuencia.padStart(3, '0');

    const area = _area.toUpperCase();
    if (area === 'ADMINISTRADOR') return `CAR${number}-ADMIN`;

    return `CAR${number}-${area[0]}`;
  };
}
