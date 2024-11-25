import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createOfferDto: CreateOfferDto) {
    const userId: number = req.user.id;
    return this.offersService.create(userId, createOfferDto);
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }
}
