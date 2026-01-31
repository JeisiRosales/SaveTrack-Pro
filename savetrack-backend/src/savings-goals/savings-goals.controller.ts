import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('savings-goals')
@UseGuards(AuthGuard('jwt'))
export class SavingsGoalsController {
    constructor(private readonly goalsService: SavingsGoalsService) { }

    // Crear meta de ahorro
    @Post()
    create(@Body() dto: CreateGoalDto, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.create(userId, dto);
    }

    // Obtener todas las metas de ahorro del usuario
    @Get()
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.goalsService.findAll(userId);
    }

    // Obtener una meta de ahorro específica
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.findOne(id, userId);
    }

    // Modificar un meta de ahorro
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateGoalDto, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.update(id, dto, userId);
    }

    // Eliminar una meta de ahorro
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.remove(id, userId);
    }
}
