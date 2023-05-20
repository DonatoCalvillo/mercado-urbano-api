import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../auth/entities';
import { Repository } from 'typeorm';
import { IResponse } from 'src/interface/response.interface';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
  ) {}

  async getAllUsers(res: Response) {
    let response: IResponse;
    // let credentials: [];

    try {
      const users = await this.userRepository.find({
        where: {
          activo: true,
          rol: {
            nombre: 'Usuario',
          },
        },
      });

      const credentials = users.map((usuario) => {
        const contrasenia = 10;
        return {
          nombre: usuario.nombre,
          apellido: `${usuario.apellido_paterno} ${usuario.apellido_materno}`,
          matricula: usuario.matricula,
        };
      });

      response = {
        success: true,
        message: 'Todos los usuarios han sido traidos.',
        data: users,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: IResponse = {
        success: true,
        message: error,
        data: {},
        error_code: 500,
      };
      res.status(500).json(response);
    }
  }

  async deleteUser(matricula: string) {
    try {
      const user = await this.userRepository.findOne({ where: { matricula } });

      if (!user)
        return {
          status: 'FAIL',
          message: 'No se encontro al usuario.',
        };

      user.activo = false;

      await this.userRepository.save(user);

      const users = await this.userRepository
        .createQueryBuilder('usuario')
        .select([
          'usuario.matricula',
          'usuario.nombre',
          'usuario.apellido_paterno',
          'usuario.apellido_materno',
          'usuario.puntos',
          'usuario.correo',
          'usuario.telefono',
        ])
        .innerJoin('usuario.rol', 'rol')
        .where('rol.nombre =:nombre', { nombre: 'Usuario' })
        .andWhere('usuario.activo = 1')
        .orderBy('usuario.puntos', 'DESC')
        .getMany();

      return {
        status: 'OK',
        message: 'Usuario eliminado correctamente.',
        data: users,
      };
    } catch (error) {}
  }
}
