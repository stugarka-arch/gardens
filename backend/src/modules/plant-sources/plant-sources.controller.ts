import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { CreatePlantSourceDto } from './dto/plant-source.dto';
import { PlantSourcesService } from './plant-sources.service';

@ApiTags('Plant sources')
@Controller('plant-sources')
export class PlantSourcesController {
  constructor(private readonly sources: PlantSourcesService) {}
  @Get('plant/:plantId') list(@Param('plantId') plantId: string) {
    return this.sources.list(plantId);
  }
  @Post('plant/:plantId')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('gardens_session')
  create(
    @CurrentUser() user: AuthUser,
    @Param('plantId') plantId: string,
    @Body() dto: CreatePlantSourceDto,
  ) {
    return this.sources.create(user.role, plantId, dto);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('gardens_session')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.sources.remove(user.role, id);
  }
}
