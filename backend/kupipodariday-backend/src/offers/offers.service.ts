import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { excludePassword } from '../utils/validation.util';

type WhereCondition = Partial<Offer>;

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createOfferDto: CreateOfferDto,
    wishId: number,
    userId: number,
  ): Promise<Offer> {
    // Проверяем существование пользователя
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Загружаем wish с offers для расчета суммы
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['offers', 'owner'],
      select: {
        id: true,
        price: true,
        raised: true,
        owner: {
          id: true,
        },
        offers: {
          id: true,
          amount: true,
        },
      },
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id === userId) {
      throw new ForbiddenException('Cannot offer on your own wish');
    }

    // Проверяем, не превышает ли сумма стоимость подарка
    const offerAmount = Number(createOfferDto.amount);
    const wishPrice = Number(wish.price);
    const currentRaised = Number(wish.raised) || 0;
    const newTotal = currentRaised + offerAmount;

    if (newTotal > wishPrice) {
      throw new BadRequestException(
        `Total amount (${newTotal}) exceeds wish price (${wishPrice})`,
      );
    }

    // Создаем offer
    const offer = this.offersRepository.create({
      amount: offerAmount,
      hidden: createOfferDto.hidden || false,
      user: { id: userId },
      item: { id: wishId },
    });

    const savedOffer = await this.offersRepository.save(offer);

    // Обновляем сумму собранных средств атомарно
    await this.wishesRepository.update(wishId, { raised: newTotal });

    // Загружаем полный offer с relations для ответа
    return this.offersRepository.findOne({
      where: { id: savedOffer.id },
      relations: ['user', 'item'],
    });
  }

  async findOne(condition: WhereCondition): Promise<Offer | null> {
    const offer = await this.offersRepository.findOne({
      where: condition,
      relations: ['user', 'item', 'item.owner'],
      select: {
        id: true,
        amount: true,
        hidden: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          about: true,
        },
        item: {
          id: true,
          name: true,
          link: true,
          image: true,
          price: true,
          raised: true,
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

    if (offer?.user) {
      offer.user = excludePassword(offer.user) as User;
    }
    if (offer?.item?.owner) {
      offer.item.owner = excludePassword(offer.item.owner) as User;
    }

    return offer;
  }

  async findMany(condition: WhereCondition): Promise<Offer[]> {
    const offers = await this.offersRepository.find({
      where: condition,
      relations: ['user', 'item'],
      select: {
        id: true,
        amount: true,
        hidden: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          about: true,
        },
        item: {
          id: true,
          name: true,
        },
      },
    });

    return offers.map((offer) => {
      if (offer.user) {
        offer.user = excludePassword(offer.user) as User;
      }
      return offer;
    });
  }

  async findWishOffers(wishId: number): Promise<Offer[]> {
    const offers = await this.offersRepository.find({
      where: { item: { id: wishId } },
      relations: ['user'],
      select: {
        id: true,
        amount: true,
        hidden: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          about: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return offers.map((offer) => {
      if (offer.user) {
        offer.user = excludePassword(offer.user) as User;
      }
      return offer;
    });
  }
}
