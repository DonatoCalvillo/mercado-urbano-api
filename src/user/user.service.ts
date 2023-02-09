import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../auth/entities';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>
  ){}

  async getAllUsers( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto

    const users = await this.userRepository.createQueryBuilder("usuario")
    .select([
      'usuario.matricula',
      'usuario.nombre',
      'usuario.apellido_paterno',
      'usuario.apellido_materno',
      'usuario.puntos',
      'usuario.correo',
      'usuario.telefono'
    ])  
    .innerJoin("usuario.rol", "rol")
    .where("rol.nombre =:nombre", {nombre: "Usuario"})
    .orderBy("usuario.puntos", "DESC")
    .getMany()

    return users
  }
}
