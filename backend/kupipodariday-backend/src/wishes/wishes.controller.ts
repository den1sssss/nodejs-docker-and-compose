import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parseId } from '../utils/validation.util';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('top')
  findTop() {
    return this.wishesService.findPopular();
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLatest();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWishDto: CreateWishDto, @Request() req) {
    return this.wishesService.create(createWishDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const wishId = parseId(id, 'wish ID');
    return this.wishesService.findOne({ id: wishId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Request() req,
  ) {
    const wishId = parseId(id, 'wish ID');
    return this.wishesService.updateOne({ id: wishId }, updateWishDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    const wishId = parseId(id, 'wish ID');
    return this.wishesService.removeOne({ id: wishId }, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  copyWish(@Param('id') id: string, @Request() req) {
    const wishId = parseId(id, 'wish ID');
    return this.wishesService.copyWish(wishId, req.user.userId);
  }
}
