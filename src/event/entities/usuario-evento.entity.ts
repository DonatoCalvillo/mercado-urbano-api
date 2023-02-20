import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Evento } from './evento.entity';
import { Lugar } from './lugar.entity';

@Entity('usuario_evento')
export class UsuarioEvento {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint', {
    nullable: false,
    default: 0
  })
  inscrito: number;

  @Column('int', {
    nullable: false,
    default: 0
  })
  puntos: number;

  @Column('varchar', {
    nullable: false
  })
  dia: string;

  @Column('datetime', {
    nullable: true
  })
  fechaInscripcion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuario_evento, {cascade: true, eager: true})
  @JoinColumn({
    name: "fk_usuario", referencedColumnName: "id"
  })
  usuario: Usuario

  @ManyToOne(() => Evento, (evento) => evento.usuario_evento, {cascade: true, eager: true})
  @JoinColumn({
    name: "fk_evento", referencedColumnName: "id"
  })
  evento: Evento

  @ManyToOne(() => Lugar, (lugar) => lugar.usuario_evento, {cascade: true, eager: true})
  @JoinColumn({
    name: "fk_lugar", referencedColumnName: "id"
  })
  lugar: Lugar
  
}