import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Body() updateDto: UpdateUserDto, @Req() req) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateDto);
  }

  @Delete(':id')
  // IMPORTANTE: Proteger esto con un Guard que verifique que el usuario se borra a sí mismo o es Admin
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.usersService.deleteUser(id);
  }
}

