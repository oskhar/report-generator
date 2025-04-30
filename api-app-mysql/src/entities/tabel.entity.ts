import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tabel')
export class TabelEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  nama: string;

  @Column()
  dansos: number;

  @Column()
  kas: number;
}
