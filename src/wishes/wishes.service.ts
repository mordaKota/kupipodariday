import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  create(createWishDto: CreateWishDto, userId: number) {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: { id: userId },
    });
    return this.wishRepository.save(wish);
  }

  async getLastWishes() {
    return this.wishRepository.find({
      select: ['id', 'name', 'link', 'image', 'price', 'description', 'copied'],
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  async getTopWishes() {
    return this.wishRepository.find({
      select: ['id', 'name', 'link', 'image', 'price', 'description', 'copied'],
      order: { copied: 'DESC' },
      take: 20,
    });
  }

  async getWishById(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return wish;
  }

  async updateWish(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.getWishById(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only edit your own wishes');
    }

    if (updateWishDto.price && wish.raised > 0) {
      throw new ForbiddenException(
        'Cannot change price if there are already contributions',
      );
    }

    await this.wishRepository.update(id, updateWishDto);

    return await this.getWishById(id);
  }

  async deleteWish(id: number, userId: number) {
    const wish = await this.getWishById(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Unauthorized to delete this wish');
    }

    await this.wishRepository.delete(id);

    return wish;
  }

  async copyWish(id: number, userId: number) {
    const wish = await this.getWishById(id);

    const copiedWish = this.wishRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: { id: userId },
      copied: 0,
    });

    wish.copied += 1;

    await this.wishRepository.save(wish);
    return this.wishRepository.save(copiedWish);
  }
}
