import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import {
  AddFlowerbedPlantDto,
  FlowerbedDto,
  UpdateFlowerbedDto,
  UpdateFlowerbedPlantDto,
} from './dto/flowerbed.dto';
import { FlowerbedsService } from './flowerbeds.service';

@ApiTags('Flowerbeds')
@Controller('flowerbeds')
@UseGuards(AuthGuard)
@ApiCookieAuth('gardens_session')
export class FlowerbedsController {
  constructor(private readonly flowerbeds: FlowerbedsService) {}
  @Post() create(@CurrentUser() user: AuthUser, @Body() dto: FlowerbedDto) {
    return this.flowerbeds.create(user.id, dto);
  }
  @Get() list(@CurrentUser() user: AuthUser) {
    return this.flowerbeds.list(user.id);
  }
  @Get(':id') one(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.flowerbeds.one(user.id, id);
  }
  @Patch(':id') update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFlowerbedDto,
  ) {
    return this.flowerbeds.update(user.id, id, dto);
  }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.flowerbeds.remove(user.id, id);
  }
  @Post(':id/plants') addPlant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddFlowerbedPlantDto,
  ) {
    return this.flowerbeds.addPlant(user.id, id, dto);
  }
  @Patch(':id/plants/:placementId') updatePlant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('placementId') placementId: string,
    @Body() dto: UpdateFlowerbedPlantDto,
  ) {
    return this.flowerbeds.updatePlant(user.id, id, placementId, dto);
  }
  @Delete(':id/plants/:placementId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePlant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('placementId') placementId: string,
  ) {
    return this.flowerbeds.removePlant(user.id, id, placementId);
  }
}
