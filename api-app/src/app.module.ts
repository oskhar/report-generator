import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Pdf } from './services/pdf';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Pdf],
})
export class AppModule {}
