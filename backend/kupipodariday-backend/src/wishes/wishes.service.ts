import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from '../users/entities/user.entity';
import { excludePassword, excludePasswordFromArray } from '../utils/validation.util';
import { DEFAULT_TAKE_LATEST, DEFAULT_TAKE_POPULAR } from '../utils/constants';

type WhereCondition = Partial<Wish>;

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: { id: userId },
      raised: 0,
      copied: 0,
    });
    const savedWish = await this.wishesRepository.save(wish);
    return this.findOne({ id: savedWish.id });
  }

  async findOne(condition: WhereCondition): Promise<Wish | null> {
    const wish = await this.wishesRepository.findOne({
      where: condition,
      relations: ['owner', 'offers', 'offers.user'],
      select: {
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
        offers: {
          id: true,
          amount: true,
          hidden: true,
          createdAt: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            about: true,
          },
        },
      },
    });

    if (!wish) {
      return null;
    }

    if (wish.owner) {
      wish.owner = excludePassword(wish.owner) as User;
    }
    if (wish.offers) {
      wish.offers = wish.offers.map((offer) => {
        if (offer.user) {
          offer.user = excludePassword(offer.user) as User;
        }
        return offer;
      });
    }

    return wish;
  }

  async findMany(condition: WhereCondition): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      where: condition,
      relations: ['owner'],
      select: {
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
    });
    return wishes.map((wish) => {
      if (wish.owner) {
        wish.owner = excludePassword(wish.owner) as User;
      }
      return wish;
    });
  }

  async updateOne(
    condition: WhereCondition,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish | null> {
    const wish = await this.findOne(condition);
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only edit your own wishes');
    }
    if (wish.offers && wish.offers.length > 0 && updateWishDto.price) {
      throw new ForbiddenException('Cannot change price when offers exist');
    }
    await this.wishesRepository.update(condition, updateWishDto);
    return this.findOne(condition);
  }

  async removeOne(condition: WhereCondition, userId: number): Promise<void> {
    const wish = await this.findOne(condition);
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own wishes');
    }
    await this.wishesRepository.delete(condition);
  }

  async findLatest(): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      take: DEFAULT_TAKE_LATEST,
      order: { createdAt: 'DESC' },
      relations: ['owner'],
      select: {
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
    });
    return wishes.map((wish) => {
      if (wish.owner) {
        wish.owner = excludePassword(wish.owner) as User;
      }
      return wish;
    });
  }

  async findPopular(): Promise<Wish[]> {
    const wishes = await this.wishesRepository.find({
      take: DEFAULT_TAKE_POPULAR,
      order: { copied: 'DESC' },
      relations: ['owner'],
      select: {
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
    });
    return wishes.map((wish) => {
      if (wish.owner) {
        wish.owner = excludePassword(wish.owner) as User;
      }
      return wish;
    });
  }

  async copyWish(wishId: number, userId: number): Promise<Wish> {
    const originalWish = await this.findOne({ id: wishId });
    if (!originalWish) {
      throw new ForbiddenException('Wish not found');
    }

    // Увеличиваем счетчик копий
    await this.wishesRepository.update(
      { id: wishId },
      { copied: originalWish.copied + 1 },
    );

    // Создаем копию подарка для пользователя
    const { id, owner, offers, copied, ...wishData } = originalWish;
    return this.create(wishData, userId);
  }
}
