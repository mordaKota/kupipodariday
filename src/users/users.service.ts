import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existedUser) {
      throw new ConflictException(
        'A user with this email or username already exists',
      );
    }

    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.about) {
      user.about = updateUserDto.about;
    }

    if (updateUserDto.avatar) {
      user.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }

    return await this.userRepository.save(user);
  }
}
