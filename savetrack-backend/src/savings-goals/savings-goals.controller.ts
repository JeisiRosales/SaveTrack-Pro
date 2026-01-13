// =============================================
// Controlador de Metas de Ahorro
// Ubicación: src/savings-goals/savings-goals.controller.ts
// =============================================
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('savings-goals')
@UseGuards(AuthGuard('jwt'))
export class SavingsGoalsController {
    constructor(private readonly goalsService: SavingsGoalsService) { }

    @Post()
    create(@Body() dto: CreateGoalDto, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.create(userId, dto);
    }

    @Get()
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.goalsService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.findOne(id, userId);
    }

    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {
        const userId = req.user.id;
        return this.goalsService.uploadImage(id, file, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateGoalDto, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.update(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        return this.goalsService.remove(id, userId);
    }
}
