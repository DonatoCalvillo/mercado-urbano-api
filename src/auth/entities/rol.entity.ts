import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from './usuario.entity';

@Entity('rol')
export class Rol {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false
  })
  nombre: string;
  
  @Column('varchar', {
    nullable: false
  })
  descripcion: string;
  
  // @Column('datetime', {
  //   default: Date.now()
  // })
  // creado_en: Date;

  @OneToOne( ()=> Usuario)
  usuario : Usuario;
  
  // @Column('datetime')
  // modificado_en: Date;

}