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
  constructor(data: Partial<DataEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  judul: string;

  @Column()
  keterangan: string;

  @OneToMany(() => TabelEntity, (tabel) => tabel.id)
  tabel: TabelEntity[];
}
