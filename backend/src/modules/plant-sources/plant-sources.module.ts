import { Module } from '@nestjs/common';
import { PlantSourcesController } from './plant-sources.controller';
import { PlantSourcesService } from './plant-sources.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PlantSourcesController],
  imports: [PrismaModule, AuthModule],
  providers: [PlantSourcesService],
})
export class PlantSourcesModule {}
