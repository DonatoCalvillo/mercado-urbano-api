import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Plaza } from './';

@Entity('lugar')
export class Lugar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint', {
    nullable: false
  })
  numero: string;

  @ManyToOne(() => Plaza, (plaza) => plaza.lugar)
  plaza: Plaza
}