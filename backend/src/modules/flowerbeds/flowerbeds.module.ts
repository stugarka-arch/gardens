import { Module } from '@nestjs/common';
import { FlowerbedsController } from './flowerbeds.controller';
import { FlowerbedsService } from './flowerbeds.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [FlowerbedsController],
  imports: [PrismaModule, AuthModule],
  providers: [FlowerbedsService],
})
export class FlowerbedsModule {}
