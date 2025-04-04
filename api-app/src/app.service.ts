import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DataDto } from './dto/data.dto';
import { UpdateDataDto } from './dto/update-data.dto';
import { TabelDto } from './dto/tabel.dto';

@Injectable()
export class AppService {
  private data: DataDto = {
    judul: '',
    tabel: [],
    keterangan: '',
  };

  constructor() {
    const filePath = path.join(__dirname, 'inject-data.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    this.data = JSON.parse(raw) as DataDto;
  }

  find() {
    return this.data;
  }

  update(updateDataDto: UpdateDataDto) {
    this.data['judul'] = updateDataDto['judul'];
    this.data['keterangan'] = updateDataDto['keterangan'];
  }

  createTabel(tabel: TabelDto) {
    tabel.id = this.data['tabel'][this.data['tabel'].length]['id'] + 1;
    this.data['tabel'] = [...this.data['tabel'], tabel];
  }

  updateTabel(id: number, tabel: TabelDto) {
    this.data['tabel'] = this.data['tabel'].map((row) =>
      row.id == id ? tabel : row,
    );
  }
}
