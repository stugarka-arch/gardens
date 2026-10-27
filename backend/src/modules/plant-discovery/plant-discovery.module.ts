import { Module } from '@nestjs/common';
import { PlantDiscoveryController } from './plant-discovery.controller';
import { PlantDiscoveryService } from './plant-discovery.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { PlantsModule } from '../plants/plants.module';
import { TaxonVerificationService } from './taxon-verification.service';

@Module({
  controllers: [PlantDiscoveryController],
  imports: [PrismaModule, AuthModule, AiModule, PlantsModule],
  providers: [PlantDiscoveryService, TaxonVerificationService],
})
export class PlantDiscoveryModule {}
