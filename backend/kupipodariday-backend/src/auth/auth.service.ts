import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    about: string;
    avatar: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
        avatar: true,
        password: true, // Нужен для проверки
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result as Omit<User, 'password'>;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>): Promise<LoginResponse> {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        about: user.about,
        avatar: user.avatar,
      },
    };
  }

  async signup(signUpDto: SignUpDto): Promise<Omit<User, 'password'>> {
    // Проверяем username и email одним запросом для оптимизации
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: signUpDto.username }, { email: signUpDto.email }],
      select: ['id', 'username', 'email'],
    });

    if (existingUser) {
      if (existingUser.username === signUpDto.username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === signUpDto.email) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.usersService.create(signUpDto);
  }
}
