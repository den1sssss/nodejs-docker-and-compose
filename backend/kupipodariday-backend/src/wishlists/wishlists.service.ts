import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { User } from '../users/entities/user.entity';
import { In } from 'typeorm';

type WhereCondition = Partial<Wishlist>;

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  private removePasswordFromOwner(wishlist: Wishlist): Wishlist {
    if (wishlist.owner && 'password' in wishlist.owner) {
      const { password, ...ownerWithoutPassword } = wishlist.owner;
      return { ...wishlist, owner: ownerWithoutPassword as User };
    }
    return wishlist;
  }

  private removePasswordFromOwners(wishlists: Wishlist[]): Wishlist[] {
    return wishlists.map(wishlist => this.removePasswordFromOwner(wishlist));
  }

  async create(createWishlistDto: CreateWishlistDto, userId: number): Promise<Wishlist> {
    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      owner: { id: userId },
    });

    const savedWishlist = await this.wishlistsRepository.save(wishlist);

    if (createWishlistDto.itemsId && createWishlistDto.itemsId.length > 0) {
      const wishes = await this.wishesRepository.find({
        where: { id: In(createWishlistDto.itemsId) },
      });
      
      if (wishes.length > 0) {
        savedWishlist.items = wishes;
        await this.wishlistsRepository.save(savedWishlist);
      }
    }
    
    const fullWishlist = await this.wishlistsRepository.findOne({
      where: { id: savedWishlist.id },
      relations: ['owner', 'items'],
    });
    
    return this.removePasswordFromOwner(fullWishlist);
  }

  async findOne(condition: WhereCondition): Promise<Wishlist | null> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: condition,
      relations: ['owner', 'items'],
    });
    return wishlist ? this.removePasswordFromOwner(wishlist) : null;
  }

  async findMany(condition: WhereCondition): Promise<Wishlist[]> {
    const wishlists = await this.wishlistsRepository.find({
      where: condition,
      relations: ['owner', 'items'],
    });
    return this.removePasswordFromOwners(wishlists);
  }

  async updateOne(
    condition: WhereCondition,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist | null> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: condition,
      relations: ['owner', 'items'],
    });
    
    if (!wishlist) {
      throw new ForbiddenException('Wishlist not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You can only edit your own wishlists');
    }

    const updateData: any = { ...updateWishlistDto };
    
    if (updateWishlistDto.itemsId !== undefined) {
      wishlist.items = [];
      await this.wishlistsRepository.save(wishlist);
      
      if (updateWishlistDto.itemsId.length > 0) {
        const wishes = await this.wishesRepository.find({
          where: { id: In(updateWishlistDto.itemsId) },
        });
        
        if (wishes.length > 0) {
          wishlist.items = wishes;
          await this.wishlistsRepository.save(wishlist);
        }
      }
      delete updateData.itemsId;
    }

    if (Object.keys(updateData).length > 0) {
      await this.wishlistsRepository.update(condition, updateData);
    }
    
    return this.findOne(condition);
  }

  async removeOne(condition: WhereCondition, userId: number): Promise<void> {
    const wishlist = await this.findOne(condition);
    if (!wishlist) {
      throw new ForbiddenException('Wishlist not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own wishlists');
    }
    
    if (wishlist.items && wishlist.items.length > 0) {
      wishlist.items = [];
      await this.wishlistsRepository.save(wishlist);
    }
    
    await this.wishlistsRepository.delete(condition);
  }
}
