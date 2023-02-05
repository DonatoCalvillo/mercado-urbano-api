import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from './rol.entity';
import { Area } from './area.entity';

@Entity('usuario')
export class Usuario {

  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column('varchar', {
    nullable: false
  })
	nombre : string;

  @Column('varchar', {
    nullable: false
  })
	apellido_paterno : string;
  
  @Column('varchar', {
    nullable: false
  })
	apellido_materno : string;

  @Column('varchar', {
    unique: true,
    nullable: false
  })
	matricula : string;

  @Column('varchar', {
    nullable: false
  })
	contrasenia : string;

  @Column('varchar', {
    nullable: false
  })
	puntos : number;

  @Column('varchar', {
    unique: true,
    nullable: false
  })
	correo : string;

  @Column('varchar', {
    unique: true,
    nullable: false
  })
	telefono : string;

  @OneToOne(
    () => Area,
    {cascade: true, eager: true}
  )

  @JoinColumn({
    name: "fk_area", referencedColumnName: "id"
  })
  area : Area;

  @OneToOne(
    () => Rol,
    {cascade: true, eager: true}
  )
  @JoinColumn({
    name: "fk_rol", referencedColumnName: "id"
  })
  rol : Rol;

  @Column('bool', {
    nullable: false,
    default: 1
  })
	activo : boolean;

  // @Column('datetime', {
  //   nullable: false,
  //   default: Date.now()
  // })
  // creado_en : Date;

  // @Column('datetime', {
  //   nullable: false,
  //   default: Date.now()
  // })
	// modificado_en : Date;

  @Column('datetime', {
    nullable: false,
    default: null
  })
	borrado_en : Date;

  @BeforeInsert()
  checkFieldsBeforeInsert(){
    this.correo = this.correo.toLowerCase().trim()
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
    this.correo = this.correo.toLowerCase().trim()
  }
}
