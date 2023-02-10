import { Lugar } from "src/event/entities";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Usuario } from './usuario.entity';

@Entity('area')
export class Area {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false
  })
  nombre: string;
  
  @Column('datetime')
  modificado_en: Date;
  
  @OneToOne( ()=> Usuario)
  usuario : Usuario;

  @OneToMany(() => Lugar, (lugar) => lugar.area)
  lugar: Lugar[]

}