import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { PlantsService } from './plants.service';
import { ListPlantsDto } from './dto/list-plants.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { CreatePlantVariantDto } from './dto/create-plant-variant.dto';

@ApiTags('Plants')
@Controller('plants')
export class PlantsController {
  constructor(private readonly plants: PlantsService) {}
  @Get('choices/search')
  choices(@Query('q') query = '') {
    return this.plants.searchChoices(query);
  }
  @Get(':id/variants')
  variants(@Param('id') id: string) {
    return this.plants.variants(id);
  }
  @Get(':id/variants/:variantId/colors/:colorId')
  variantColor(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Param('colorId') colorId: string,
  ) {
    return this.plants.variantColor(id, variantId, colorId);
  }
  @Post(':id/variants')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('gardens_session')
  createVariant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreatePlantVariantDto,
  ) {
    return this.plants.createVerifiedVariant(user.role, id, dto);
  }
  @Get() list(@Query() dto: ListPlantsDto) {
    return this.plants.list(dto);
  }
  @Get('collection')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('gardens_session')
  collection(@CurrentUser() user: AuthUser) {
    return this.plants.collection(user.id);
  }
  @Post(':id/collection')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('gardens_session')
  add(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.plants.addToCollection(user.id, id);
  }
  @Delete(':id/collection')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('gardens_session')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.plants.removeFromCollection(user.id, id);
  }
  @Get(':id') one(@Param('id') id: string) {
    return this.plants.one(id);
  }
}
