import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingDto } from './dto/create-user-setting.dto';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user-settings')
@UseGuards(AuthGuard('jwt'))
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) { }

  // Crear configuración de usuario
  @Post()
  create(@Request() req, @Body() createDto: CreateUserSettingDto) {
    return this.userSettingsService.create(req.user.sub, createDto);
  }

  // Obtener configuración de usuario
  @Get()
  findMine(@Request() req) {
    return this.userSettingsService.findByUserId(req.user.sub);
  }

  // Modificar configuración de usuario
  @Patch()
  update(@Request() req, @Body() updateDto: UpdateUserSettingDto) {
    return this.userSettingsService.update(req.user.sub, updateDto);
  }
}