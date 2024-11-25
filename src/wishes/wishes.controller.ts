import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createWishDto: CreateWishDto) {
    const userId = req.user.id;
    return this.wishesService.create(createWishDto, userId);
  }

  @Public()
  @Get('last')
  getLastWishes() {
    return this.wishesService.getLastWishes();
  }

  @Public()
  @Get('top')
  getTopWishes() {
    return this.wishesService.getTopWishes();
  }

  @Get(':id')
  getWishById(@Param('id') id: string) {
    return this.wishesService.getWishById(+id);
  }

  @Patch(':id')
  updateWish(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: RequestWithUser,
  ) {
    const userId: number = req.user.id;
    return this.wishesService.updateWish(+id, updateWishDto, userId);
  }

  @Delete(':id')
  deleteWish(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId: number = req.user.id;
    return this.wishesService.deleteWish(+id, userId);
  }

  @Post(':id/copy')
  copyWish(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.wishesService.copyWish(+id, req.user.id);
  }
}
