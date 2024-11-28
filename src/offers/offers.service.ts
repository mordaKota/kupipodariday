import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { DataSource, Repository } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createOfferDto: CreateOfferDto) {
    const { amount, itemId } = createOfferDto;

    return await this.dataSource.transaction(async (manager) => {
      const wish = await manager.findOne(Wish, {
        where: { id: itemId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wish) {
        throw new NotFoundException('Wish not found');
      }

      const wishWithRelations = await manager.findOne(Wish, {
        where: { id: itemId },
        relations: ['owner', 'offers'],
      });

      if (wishWithRelations.owner.id === userId) {
        throw new ForbiddenException('You cannot contribute to your own wish');
      }

      const totalRaised = (wishWithRelations.offers || []).reduce(
        (sum, offer) => sum + offer.amount,
        0,
      );

      if (totalRaised + amount > wishWithRelations.price) {
        throw new ForbiddenException(
          'Contribution exceeds the remaining amount needed',
        );
      }

      const offer = manager.create(Offer, {
        ...createOfferDto,
        user: { id: userId },
        item: wish,
      });

      await manager.save(offer);

      wish.raised =
        parseFloat(
          (wishWithRelations.offers || [])
            .reduce((sum, offer) => sum + offer.amount, 0)
            .toFixed(2),
        ) + amount;

      await manager.save(wish);

      return offer;
    });
  }

  async findAll() {
    return this.offerRepository.find({ relations: ['user', 'item'] });
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: [
        'user',
        'user.wishes',
        'user.wishlists',
        'user.wishlists.items',
        'item',
        'item.owner',
        'item.offers',
      ],
    });
    if (!offer) {
      throw new NotFoundException(`Offer with id ${id} not found`);
    }
    return offer;
  }
}
