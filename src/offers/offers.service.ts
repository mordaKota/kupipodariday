import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(userId: number, createOfferDto: CreateOfferDto) {
    const { amount, itemId } = createOfferDto;

    const wish = await this.wishRepository.findOne({
      where: { id: itemId },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id === userId) {
      throw new ForbiddenException('You cannot contribute to your own wish');
    }

    const totalRaised = wish.offers.reduce(
      (sum, offer) => sum + offer.amount,
      0,
    );
    if (totalRaised + amount > wish.price) {
      throw new ForbiddenException(
        'Contribution exceeds the remaining amount needed',
      );
    }

    const offer = this.offerRepository.create({
      ...createOfferDto,
      user: { id: userId },
      item: wish,
    });

    return this.offerRepository.save(offer);
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
