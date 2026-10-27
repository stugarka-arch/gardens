import { Module } from '@nestjs/common';
import { FlowerbedsController } from './flowerbeds.controller';
import { FlowerbedsService } from './flowerbeds.service';

@Module({
  controllers: [FlowerbedsController],
  providers: [FlowerbedsService]
})
export class FlowerbedsModule {}
