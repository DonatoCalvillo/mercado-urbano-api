import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Rol } from './rol.entity';
import { Area } from './area.entity';
import { UsuarioEvento } from '../../event/entities/usuario-evento.entity';
import { IsOptional } from 'class-validator';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false,
  })
  nombre: string;

  @Column('varchar', {
    nullable: false,
  })
  apellido_paterno: string;

  @Column('varchar', {
    nullable: false,
  })
  apellido_materno: string;

  @Column('varchar', {
    unique: true,
    nullable: false,
  })
  matricula: string;

  @Column('varchar', {
    nullable: false,
  })
  contrasenia: string;

  @Column('varchar', {
    nullable: false,
  })
  puntos: number;

  @Column('varchar', {
    unique: true,
    nullable: false,
  })
  correo: string;

  @Column('varchar', {
    unique: true,
    nullable: false,
  })
  telefono: string;

  @OneToOne(() => Area, { cascade: true, eager: true })
  @JoinColumn({
    name: 'fk_area',
    referencedColumnName: 'id',
  })
  area: Area;

  @OneToOne(() => Rol, { cascade: true, eager: true })
  @JoinColumn({
    name: 'fk_rol',
    referencedColumnName: 'id',
  })
  rol: Rol;

  @Column('bool', {
    nullable: false,
    default: 1,
  })
  activo: boolean;

  @Column('datetime', {
    nullable: false,
    default: null,
  })
  borrado_en: Date;

  @OneToMany(() => UsuarioEvento, (usuario_evento) => usuario_evento.usuario)
  usuario_evento: UsuarioEvento[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    if (this.correo) this.correo = this.correo.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    if (this.correo) this.correo = this.correo.toLowerCase().trim();
  }
}
