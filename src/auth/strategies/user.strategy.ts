import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area, Rol, Usuario } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserValidation {
  constructor(
    @InjectRepository(Usuario)
    private readonly useRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  VerifyEmail = async (correo: string): Promise<boolean> => {
    Logger.log(`Verificando correo: ${correo}`);
    const emailVerify = await this.useRepository.findOne({
      where: { correo: correo },
    });

    if (emailVerify) {
      Logger.error(`Correo ya registrado.`);
      return true;
    }

    return false;
  };

  VerifyRol = async (rol: string) => {
    Logger.log(`Verificando rol: ${rol}`);
    const rolVerify = await this.rolRepository.findOne({
      where: { nombre: rol },
    });

    if (!rolVerify) {
      Logger.error(`Rol inexistente: ${rol}`);
      return null;
    }

    return rolVerify;
  };

  VerifyArea = async (area: string) => {
    Logger.log(`Verificando area: ${area}`);

    const areaVerify = await this.areaRepository.findOne({
      where: { nombre: area },
    });

    if (!areaVerify) {
      Logger.error(`Area inexistente id: ${area}`);
      return null;
    }
    return areaVerify;
  };

  VerifyPhone = async (phone: string) => {
    Logger.log(`Verificando telefono: ${phone}`);
    const phoneVerify = await this.useRepository.findOne({
      where: { telefono: phone },
    });

    if (phoneVerify) {
      Logger.error(`Telefono ya existe: ${phone}`);
      return phoneVerify;
    }

    return null;
  };
}
