import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Response } from 'express';

import { generate } from 'generate-password';

import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';

import { ChangePasswordDto, CreateUsuarioDto, LoginUsuarioDto } from './dto';

import { Usuario, Rol, Area } from './entities';

import { IJwtPayload } from './interfaces';
import { ValidLogTypes, logStandar } from 'src/helper/logStandar';
import { IResponse } from 'src/interface/response.interface';
import { Workbook } from 'exceljs';
import { HttpResponse } from './strategies/errors.strategy';
import { UserValidation } from './strategies/user.strategy';
import { retry } from 'rxjs';

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

    private readonly httpResponse: HttpResponse,

    private readonly userValidation: UserValidation,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto, res: Response) {
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
      }: CreateUsuarioDto = createUsuarioDto;

      if (userData.telefono) {
      }

      if (userData.correo != undefined) {
        if (await this.userValidation.VerifyEmail(userData.correo))
          return this.httpResponse.NotFound(res, `Correo ya registrado.`);
      }

      const rol = await this.userValidation.VerifyRol(fk_rol);
      if (!rol)
        return this.httpResponse.NotFound(res, `Rol inexistente: ${fk_rol}`);

      const area = await this.userValidation.VerifyArea(fk_area);
      if (!area)
        return this.httpResponse.NotFound(res, `Area inexistente: ${fk_area}`);

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
        puntos: 1500,
      });

      Logger.log(`Guardando usuario en base de datos. ==> ${matricula}`);
      await this.useRepository.save(user);

      Logger.log(`Usuario creado exitosamente. ==> ${matricula}`);
      return this.httpResponse.Ok(res, 'Usuario creado exitosamente.', {
        user,
      });
    } catch (error) {
      Logger.error(error);
      return this.httpResponse.Error(
        res,
        'Algo salio mal, favor de comunicarse con el administrador.',
      );
    } finally {
      logStandar();
    }
  }

  async login(loginUsuarioDto: LoginUsuarioDto, res: Response) {
    logStandar('LOGIN', '-', ValidLogTypes.log);

    const { contrasenia, matricula }: LoginUsuarioDto = loginUsuarioDto;

    Logger.log(`Verificando usuario. ==> ${matricula}`);

    try {
      const user: Usuario = await this.useRepository.findOne({
        select: {
          id: true,
          matricula: true,
          puntos: true,
          nombre: true,
          contrasenia: true,
          apellido_paterno: true,
          apellido_materno: true,
        },
        where: {
          matricula,
          rol: {
            nombre: 'Usuario',
          },
        },
      });

      console.log(user);
      if (!user || !bcrypt.compareSync(contrasenia, user.contrasenia)) {
        Logger.error('Credenciales invalidas.');
        return this.httpResponse.NotFound(res, 'Credenciales invalidas.');
      }

      const { area, rol, ...finalUser } = user;

      const data = {
        ...finalUser,
        rol_nombre: rol.nombre,
        area: area.nombre,
      };

      Logger.log(`Acceso verificado correctamente. ==> ${matricula}`);

      return this.httpResponse.Ok(
        res,
        'Acceso de usuario exitoso.',
        { user: data },
        this.getJwtToken({ matricula: user.matricula }),
      );
    } catch (error) {
      Logger.error(error);

      return this.httpResponse.Error(
        res,
        'Algo salio mal, favor de comunicarse con el administrador.',
        error,
      );
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

  async changePassword(
    user: Usuario,
    res: Response,
    changePasswordDto: ChangePasswordDto,
  ) {
    let response: IResponse;
    try {
      const { newPassword } = changePasswordDto;
      user.contrasenia = bcrypt.hashSync(newPassword, 10);
      await this.useRepository.save(user);

      response = {
        success: true,
        data: {
          user,
        },
        message: 'Contraseña cambiada exitosamente.',
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

  async masiveRegister(file: Express.Multer.File, res: Response) {
    try {
      let response: IResponse;
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

      const secuenciaG = await this.useRepository.query(
        `SELECT COUNT(1) AS secuencia FROM usuario WHERE fk_area='Gastronomia'`,
      );

      const secuenciaC = await this.useRepository.query(
        `SELECT COUNT(1) AS secuencia FROM usuario WHERE fk_area='Comercio'`,
      );

      let secG = Number(secuenciaG[0].secuencia);
      let secC = Number(secuenciaC[0].secuencia);

      const newUsers = await Promise.all(
        excelData.map(async (newUser) => {
          newUser.nombre = newUser.nombre.toUpperCase();
          newUser.nombre = newUser.nombre.substring(
            0,
            newUser.nombre.length - 1,
          );

          newUser.apellido_paterno = newUser.apellido_paterno.toUpperCase();
          newUser.apellido_paterno = newUser.apellido_paterno.substring(
            0,
            newUser.apellido_paterno.length - 1,
          );

          newUser.apellido_materno = newUser.apellido_materno.toUpperCase();
          newUser.apellido_materno = newUser.apellido_materno.substring(
            0,
            newUser.apellido_materno.length - 1,
          );

          const contrasenia = generate({
            length: 10,
            numbers: true,
            uppercase: true,
            lowercase: true,
            symbols: true,
          });

          newUser.contrasenia = contrasenia;

          try {
            const rol = await this.rolRepository.findOne({
              where: { nombre: 'Usuario' },
            });

            const area = await this.areaRepository.findOne({
              where: { nombre: newUser.fk_area },
            });

            let secuencia;
            if (area.nombre == 'Gastronomia') secuencia = ++secG;
            if (area.nombre == 'Comercio') secuencia = ++secC;

            const matricula = this.generateMatricula(
              secuencia.toString(),
              area.nombre,
            );

            const tempUser = this.useRepository.create({
              ...newUser,
              contrasenia: bcrypt.hashSync(contrasenia, 10),
              rol,
              area,
              correo: newUser.correo ? newUser.correo : null,
              telefono: newUser.telefono ? newUser.telefono : null,
              matricula,
            });

            await this.useRepository.save(tempUser);

            return { ...tempUser, contraseñaDesencript: contrasenia };
            // return { rol, area, areeea: newUser.fk_area };
          } catch (error) {
            console.log(error);
          }
        }),
      );

      response = {
        success: true,
        data: newUsers,
        message: 'The masive register was success.',
      };

      return res.status(200).json(response);
    } catch (error) {
      const response: IResponse = {
        success: false,
        message: 'Internal server error: ' + error,
        data: {},
        error_code: 500,
      };
      return res.status(500).json(response);
    }
  }
}
