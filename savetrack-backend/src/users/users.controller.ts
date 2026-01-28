import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Actualizar perfil
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Body() updateDto: UpdateUserDto, @Req() req) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateDto);
  }

  // Eliminar perfil
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.usersService.deleteUser(id);
  }
}

