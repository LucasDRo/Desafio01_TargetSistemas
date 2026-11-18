import { Module } from '@nestjs/common';
import { ComissionModule } from './comission/comission.module';

@Module({
  imports: [ComissionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
