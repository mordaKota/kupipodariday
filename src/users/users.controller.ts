import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/wishes')
  getOwnWishes(@Req() req: RequestWithUser) {
    const userId: number = req.user.id;
    return this.usersService.getUserWishes(userId);
  }

  @Get('me')
  getOwnProfile(@Req() req: RequestWithUser) {
    const userId: number = req.user.id;
    return this.usersService.getUserProfile(userId);
  }

  @Patch('me')
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    const userId: number = req.user.id;
    return this.usersService.update(userId, updateUserDto);
  }

  @Get('/:username/wishes')
  getUserWishes(@Param('username') username: string) {
    return this.usersService.getWishesByUsername(username);
  }

  @Get(':username')
  findOneByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('find')
  findMany(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }
}
