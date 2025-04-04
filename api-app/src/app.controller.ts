import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { ZodPipe } from './pipes/zod.pipe';
import { UpdateDataSchema, UpdateDataDto } from './dto/update-data.dto';
import { z } from 'zod';
import { TabelSchema, TabelDto } from './dto/tabel.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  find() {
    return this.appService.find();
  }

  @Put()
  update(@Body(new ZodPipe(UpdateDataSchema)) updateDataDto: UpdateDataDto) {
    return this.appService.update(updateDataDto);
  }

  @Post('tabel')
  createTabel(@Body(new ZodPipe(TabelSchema)) tabel: TabelDto) {
    return this.appService.createTabel(tabel);
  }
}
