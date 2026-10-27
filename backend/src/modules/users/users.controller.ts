import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
@ApiCookieAuth('gardens_session')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get('me') me(@CurrentUser() user: AuthUser) {
    return this.users.profile(user.id);
  }
  @Patch('me') update(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(user.id, dto);
  }
  @Get('me/flowerbeds') flowerbeds(@CurrentUser() user: AuthUser) {
    return this.users.flowerbeds(user.id);
  }
}
