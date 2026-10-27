import { Module } from '@nestjs/common';
import { PlantSourcesController } from './plant-sources.controller';
import { PlantSourcesService } from './plant-sources.service';

@Module({
  controllers: [PlantSourcesController],
  providers: [PlantSourcesService]
})
export class PlantSourcesModule {}
