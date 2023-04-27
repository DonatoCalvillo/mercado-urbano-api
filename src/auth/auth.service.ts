import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Response } from 'express';

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

  async create(createUsuarioDto: CreateUsuarioDto, res: Response) {
    logStandar('CREANDO USUARIO', '-', ValidLogTypes.log);
    let response: IResponse;

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

      if (emailVerify) {
        response = {
          success: false,
          message: `Correo ya registrado.`,
          data: {},
          error_code: 404,
        };

        return res.status(404).json(response);
      }

      Logger.log(`Verificando rol: ${fk_rol}`);
      const rol = await this.rolRepository.findOne({
        where: { nombre: fk_rol },
      });

      if (!rol) {
        response = {
          success: false,
          message: `Rol inexistente: ${fk_rol}`,
          data: {},
          error_code: 404,
        };

        return res.status(404).json(response);
      }

      const area = await this.areaRepository.findOne({
        where: { nombre: fk_area },
      });

      if (!area) {
        response = {
          success: false,
          message: `Area inexistente id: ${fk_area}`,
          data: {},
          error_code: 404,
        };

        return res.status(404).json(response);
      }

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

      response = {
        success: true,
        message: 'Usuario creado exitosamente.',
        data: {
          user: newUser,
        },
      };

      return response;
    } catch (error) {
      const response: IResponse = {
        success: false,
        message: 'Algo salio mal, favor de comunicarse con el administrador.',
        data: {},
        error_code: 500,
      };
      Logger.error(error);
      return res.status(500).json(response);
    } finally {
      logStandar();
    }
  }

  async login(loginUsuarioDto: LoginUsuarioDto, res: Response) {
    logStandar('LOGIN', '-', ValidLogTypes.log);

    let response: IResponse;

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
        response = {
          success: false,
          message: `Credenciales invalidas.`,
          data: {},
          error_code: 401,
        };

        return res.status(401).json(response);
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

      response = {
        success: true,
        message: 'Acceso de usuario exitoso.',
        data: { user: final_user },
        token: this.getJwtToken({ matricula: user.matricula }),
      };

      return res.status(200).json(response);
    } catch (error) {
      const response: IResponse = {
        success: false,
        message: 'Algo salio mal, favor de comunicarse con el administrador.',
        data: {},
        error_code: 500,
      };
      Logger.error(error);
      return res.status(500).json(response);
    } finally {
      logStandar();
    }
  }

  async loginAdmin(loginUsuarioDto: LoginUsuarioDto, res: Response) {
    logStandar('ADMIN LOGIN', '-', ValidLogTypes.log);

    let response: IResponse;

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

      if (!user || !bcrypt.compareSync(contrasenia, user.contrasenia)) {
        response = {
          success: false,
          message: `Credenciales invalidas.`,
          data: {},
          error_code: 401,
        };

        return res.status(401).json(response);
      }

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

      response = {
        success: true,
        message: 'Acceso de administrador exitoso.',
        data: { user: final_user },
        token: this.getJwtToken({ matricula: user.matricula }),
      };

      return res.status(200).json(response);
    } catch (error) {
      const response: IResponse = {
        success: false,
        message: 'Algo salio mal, favor de comunicarse con el administrador.',
        data: {},
        error_code: 500,
      };
      Logger.error(error);
      return res.status(500).json(response);
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
