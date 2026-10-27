import { Module } from '@nestjs/common';
import { PlantsController } from './plants.controller';
import { PlantsService } from './plants.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PlantsController],
  imports: [PrismaModule, AuthModule],
  providers: [PlantsService],
  exports: [PlantsService],
})
export class PlantsModule {}
