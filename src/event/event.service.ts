import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lugar, Plaza } from './entities';
import { Repository } from 'typeorm';
import { Area } from 'src/auth/entities';

@Injectable()
export class EventService {

  constructor (
    @InjectRepository(Lugar)
    private readonly lugarRepository: Repository<Lugar>,

    @InjectRepository(Plaza)
    private readonly plazaRepository: Repository<Plaza>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>
  ){}

  async generarLugares() {
    try {
      const plaza = await this.plazaRepository.findOne({where: {id: 'e7f146b6-a8bb-11ed-96ab-4bda625ca93a'}})

      const area = await this.areaRepository.findOne({where:{id:'3bb1acfd-9d93-11ed-8c7e-a453eed313a7'}})

      for (let index = 1; index <= 50; index++) {
        const lugar = this.lugarRepository.create({
          numero: index,
          area,
          plaza
        })
        
        await this.lugarRepository.save(lugar)
      }


      return "OK"
    } catch (error) {
      return error
    }
  }
}
