import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlantsModule } from './modules/plants/plants.module';
import { PlantDiscoveryModule } from './modules/plant-discovery/plant-discovery.module';
import { PlantSourcesModule } from './modules/plant-sources/plant-sources.module';
import { FlowerbedsModule } from './modules/flowerbeds/flowerbeds.module';
import { FilesModule } from './modules/files/files.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlantsModule,
    PlantDiscoveryModule,
    PlantSourcesModule,
    FlowerbedsModule,
    FilesModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
