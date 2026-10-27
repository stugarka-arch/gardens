import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { DiscoverPlantDto } from './dto/discover-plant.dto';
import { PlantDiscoveryService } from './plant-discovery.service';

@ApiTags('Plant discovery')
@Controller('plant-discovery')
@UseGuards(AuthGuard)
@ApiCookieAuth('gardens_session')
export class PlantDiscoveryController {
  constructor(private readonly discovery: PlantDiscoveryService) {}
  @Post() discover(
    @CurrentUser() user: AuthUser,
    @Body() dto: DiscoverPlantDto,
  ) {
    return this.discovery.discover(user.id, dto);
  }
  @Get() history(@CurrentUser() user: AuthUser) {
    return this.discovery.history(user.id);
  }
  @Get('registry-suggestions') registrySuggestions(@Query('q') query = '') {
    return this.discovery.registrySuggestions(query);
  }
  @Post('confirm-registry-taxon') confirmRegistryTaxon(
    @CurrentUser() user: AuthUser,
    @Body() dto: DiscoverPlantDto,
  ) {
    return this.discovery.confirmRegistryTaxon(user.id, dto);
  }
}
