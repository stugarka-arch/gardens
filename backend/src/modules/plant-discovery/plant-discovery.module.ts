import { Module } from '@nestjs/common';
import { PlantDiscoveryController } from './plant-discovery.controller';
import { PlantDiscoveryService } from './plant-discovery.service';

@Module({
  controllers: [PlantDiscoveryController],
  providers: [PlantDiscoveryService]
})
export class PlantDiscoveryModule {}
