import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parseId } from '../utils/validation.util';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':wishId')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('wishId') wishId: string,
    @Body() createOfferDto: CreateOfferDto,
    @Request() req,
  ) {
    const parsedWishId = parseId(wishId, 'wish ID');
    return this.offersService.create(createOfferDto, parsedWishId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wish/:wishId')
  findWishOffers(@Param('wishId') wishId: string) {
    const parsedWishId = parseId(wishId, 'wish ID');
    return this.offersService.findWishOffers(parsedWishId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const offerId = parseId(id, 'offer ID');
    return this.offersService.findOne({ id: offerId });
  }
}
