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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(['wishlists', 'wishlistlists'])
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWishlistDto: CreateWishlistDto, @Request() req) {
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.wishlistsService.create(createWishlistDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.wishlistsService.findMany({});
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wishlistId = parseInt(id);
    if (isNaN(wishlistId)) {
      throw new BadRequestException('Invalid wishlist ID');
    }
    const wishlist = await this.wishlistsService.findOne({ id: wishlistId });
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Request() req,
  ) {
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('User not authenticated');
    }
    const wishlistId = parseInt(id);
    if (isNaN(wishlistId)) {
      throw new BadRequestException('Invalid wishlist ID');
    }
    return this.wishlistsService.updateOne(
      { id: wishlistId },
      updateWishlistDto,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('User not authenticated');
    }
    const wishlistId = parseInt(id);
    if (isNaN(wishlistId)) {
      throw new BadRequestException('Invalid wishlist ID');
    }
    await this.wishlistsService.removeOne({ id: wishlistId }, req.user.userId);
    return;
  }
}
