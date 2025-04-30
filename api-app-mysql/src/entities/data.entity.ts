import { TabelEntity } from 'src/entities/tabel.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('data')
export class DataEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  judul: string;

  @Column()
  keterangan: string;

  @OneToMany(() => TabelEntity, (tabel) => tabel.id)
  @JoinColumn({ name: 'tabel_id' })
  tabel: TabelEntity[];
}
