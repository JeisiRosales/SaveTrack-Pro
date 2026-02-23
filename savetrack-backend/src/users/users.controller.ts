import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Actualizar perfil
  @Patch('profile')
  async updateProfile(@Body() updateDto: UpdateUserDto, @Req() req) {
    return this.usersService.updateProfile(req.user.id, updateDto);
  }

  // Eliminar perfil
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.usersService.deleteUser(req.user.id);
  }
}

