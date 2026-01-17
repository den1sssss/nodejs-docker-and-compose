import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parseId } from '../utils/validation.util';
import { MIN_SEARCH_QUERY_LENGTH } from '../utils/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne({ id: req.user.userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  getMyWishes(@Request() req) {
    return this.usersService.findUserWishes(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne({ id: req.user.userId }, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('find')
  findUsers(@Body() body: { query: string }) {
    const query = body.query?.trim() || '';
    if (query.length < MIN_SEARCH_QUERY_LENGTH) {
      return [];
    }
    return this.usersService.findByUsernameOrEmail(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const userId = parseId(id, 'user ID');
    return this.usersService.findOne({ id: userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/wishes')
  findUserWishes(@Param('id') id: string) {
    const userId = parseId(id, 'user ID');
    return this.usersService.findUserWishes(userId);
  }
}
