import { Lugar, Plaza } from "src/event/entities";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UsuarioEvento } from "./usuario-evento.entity";

@Entity('evento')
export class Evento {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false
  })
  nombre: string;

  @Column('varchar', {
    nullable: false
  })
  semana: string;

  @Column('varchar', {
    nullable: false
  })
  hora: string;

  @Column('datetime', {
    nullable: false
  })
  fechaInicio: Date;

  @Column('datetime')
  fechaFin: Date;

  @Column('bit')
  activo: number;
  
  @Column('datetime')
  creado_en: Date;

  @Column('datetime')
  modificado_en: Date;
  
  @ManyToOne(() => Plaza, (plaza) => plaza.lugar, {cascade: true, eager: true})
  @JoinColumn({
    name: "fk_plaza", referencedColumnName: "id"
  })
  plaza: Plaza

  @OneToMany(() => UsuarioEvento, (usuario_evento) => usuario_evento.usuario)
  usuario_evento: UsuarioEvento[]
  
}