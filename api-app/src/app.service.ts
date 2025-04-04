import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DataDto } from './dto/data.dto';

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
}
