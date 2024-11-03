import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.generateToken(signInDto.username);
  }
}
