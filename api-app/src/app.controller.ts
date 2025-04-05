import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { ZodPipe } from './pipes/zod.pipe';
import { UpdateDataSchema, UpdateDataDto } from './dto/update-data.dto';
import { TabelSchema, TabelDto } from './dto/tabel.dto';
import { PdfService } from './services/pdf';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pdfService: PdfService,
  ) {}

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

  @Get('pdf')
  async generatePDF(@Res() res: Response) {
    const buffer = await this.pdfService.generatePdf(this.appService.data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=laporan.pdf',
    });

    return res.send(buffer);
  }
}
