import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ZodPipe } from './pipes/zod.pipe';
import { UpdateDataSchema, UpdateDataDto } from './dto/update-data.dto';
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

  @Put('tabel/:id')
  updateTabel(
    @Param('id') id: string,
    @Body(new ZodPipe(TabelSchema)) tabel: TabelDto,
  ) {
    return this.appService.updateTabel(+id, tabel);
  }

  @Delete('tabel/:id')
  deleteTabel(@Param('id') id: string) {
    this.appService.deleteTabel(+id);
  }
}
