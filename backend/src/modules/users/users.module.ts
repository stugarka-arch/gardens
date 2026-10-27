import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UsersController],
  imports: [PrismaModule, AuthModule],
  providers: [UsersService],
})
export class UsersModule {}
