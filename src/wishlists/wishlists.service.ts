import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { In, Repository } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(userId: number, createWishlistDto: CreateWishlistDto) {
    const { itemsId, ...wishlistData } = createWishlistDto;
    const wishes = await this.getAndCheckWishesForCollection(userId, itemsId);

    const wishlist = this.wishlistRepository.create({
      ...wishlistData,
      owner: { id: userId },
      items: wishes,
    });
    return this.wishlistRepository.save(wishlist);
  }

  async findAll() {
    return this.wishlistRepository.find({ relations: ['items'] });
  }

  async findOne(id: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with id ${id} not found`);
    }

    return wishlist;
  }

  async update(
    id: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const { itemsId, ...wishlistData } = updateWishlistDto;
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('You are not allowed to edit this wishlist');
    }

    if (itemsId) {
      wishlist.items = await this.getAndCheckWishesForCollection(
        userId,
        itemsId,
      );
    }

    if (wishlistData.name) {
      wishlist.name = wishlistData.name;
    }

    if (wishlistData.description) {
      wishlist.description = wishlistData.description;
    }

    if (wishlistData.image) {
      wishlist.image = wishlistData.image;
    }

    return this.wishlistRepository.save(wishlist);
  }

  async remove(id: number, userId: number) {
    const wishlist = await this.findOne(id);
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this wishlist',
      );
    }

    await this.wishlistRepository.remove(wishlist);
    return { message: 'Wishlist deleted successfully' };
  }

  private async getAndCheckWishesForCollection(userId, itemsId) {
    const wishes = await this.wishRepository.find({
      where: { id: In(itemsId) },
      relations: ['owner'],
    });

    if (wishes.length !== itemsId.length) {
      throw new NotFoundException('One or more items not found');
    }

    const invalidWishes = wishes.filter((wish) => wish.owner.id !== userId);
    if (invalidWishes.length > 0) {
      throw new ForbiddenException(
        'You can only add your own wishes to the wishlist',
      );
    }
    return wishes;
  }
}
