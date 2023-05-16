import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../auth/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
  ) {}

  async getAllUsers() {
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

    return users;
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
