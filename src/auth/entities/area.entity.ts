import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from './usuario.entity';

@Entity('area')
export class Area {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    nullable: false
  })
  nombre: string;
  
  // @Column('datetime', {
  //   default: Date.now()
  // })
  // creado_en: Date;
  
  @Column('datetime')
  modificado_en: Date;
  
  @OneToOne( ()=> Usuario)
  usuario : Usuario;

}