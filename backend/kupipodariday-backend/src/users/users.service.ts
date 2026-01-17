import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { excludePassword, excludePasswordFromArray } from '../utils/validation.util';

type WhereCondition = Partial<User>;

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);
    return excludePassword(savedUser);
  }

  async findOne(condition: WhereCondition): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({
      where: condition,
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        password: false, // Явно исключаем пароль
      },
    });
    return user ? excludePassword(user) : null;
  }

  async findOneWithPassword(condition: WhereCondition): Promise<User | null> {
    return this.usersRepository.findOne({ where: condition });
  }

  async findMany(condition: WhereCondition): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.usersRepository.find({
      where: condition,
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    return excludePasswordFromArray(users);
  }

  async updateOne(
    condition: WhereCondition,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    const updateData = { ...updateUserDto };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, this.SALT_ROUNDS);
    }
    await this.usersRepository.update(condition, updateData);
    return this.findOne(condition);
  }

  async removeOne(condition: WhereCondition): Promise<void> {
    await this.usersRepository.delete(condition);
  }

  async findByUsernameOrEmail(search: string): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.about',
        'user.avatar',
        'user.createdAt',
        'user.updatedAt',
      ])
      .where('user.username ILIKE :search OR user.email ILIKE :search', {
        search: `%${search}%`,
      })
      .limit(20) // Ограничиваем количество результатов
      .getMany();

    return excludePasswordFromArray(users);
  }

  async findUserWishes(userId: number): Promise<any[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishes', 'wishes.owner'],
      select: {
        id: true,
        wishes: {
          id: true,
          name: true,
          link: true,
          image: true,
          price: true,
          raised: true,
          description: true,
          copied: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            about: true,
          },
        },
      },
    });

    if (!user?.wishes) {
      return [];
    }

    // Удаляем пароли из владельцев wishes
    return user.wishes.map((wish) => {
      if (wish.owner) {
        wish.owner = excludePassword(wish.owner) as User;
      }
      return wish;
    });
  }
}
