import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Plaza } from './';
import { Area } from '../../auth/entities/area.entity';
import { UsuarioEvento } from './usuario-evento.entity';

@Entity('lugar')
export class Lugar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint', {
    nullable: false
  })
  numero: number;

  @Column('smallint', {
    nullable: false,
    default: 0
  })
  ocupado: number;

  @ManyToOne(() => Plaza, (plaza) => plaza.lugar, {cascade: true, eager: true})
  @JoinColumn({
    name: "fk_plaza", referencedColumnName: "id"
  })
  plaza: Plaza

  @ManyToOne(() => Area, (area) => area.lugar, {cascade: true, eager: true})
  @JoinColumn({
    name: "fk_area", referencedColumnName: "id"
  })
  area: Area

  @OneToMany(() => UsuarioEvento, (usuario_evento) => usuario_evento.usuario)
  usuario_evento: UsuarioEvento[]
}