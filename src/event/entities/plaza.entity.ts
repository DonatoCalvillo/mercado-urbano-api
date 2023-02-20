import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Lugar } from './';
import { Evento } from './evento.entity';

@Entity('plaza')
export class Plaza {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false
  })
  nombre: string;
  
  @Column('varchar', {
    nullable: false
  })
  direccion: string;

  @Column('datetime')
	creado_en : Date;

  @Column('datetime')
	modificado_en : Date;

  @OneToMany(() => Lugar, (lugar) => lugar.plaza)
  lugar: Lugar[]

  @OneToMany(() => Evento, (evento) => evento.plaza)
  evento: Evento[]
}