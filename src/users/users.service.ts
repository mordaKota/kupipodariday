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
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

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

    createUserDto.password = await this.hashPassword(createUserDto.password);

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
    const user = await this.findOneById(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExists = await this.userRepository.findOneBy({
        username: updateUserDto.username,
      });
      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
      user.username = updateUserDto.username;
    }

    if (updateUserDto.about) {
      user.about = updateUserDto.about;
    }

    if (updateUserDto.avatar) {
      user.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existedUser = await this.userRepository.findOne({
        where: [{ email: updateUserDto.email }],
      });

      if (existedUser) {
        throw new ConflictException('Email already exists');
      }

      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }

    return await this.userRepository.save(user);
  }

  async getUserProfile(id: number) {
    return await this.findOneById(id);
  }

  async findMany(query: string) {
    return await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }

  async getUserWishes(userId: number) {
    const wishes = await this.wishesRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
    return wishes;
  }

  async getWishesByUsername(username: string) {
    const user = await this.findOneByUsername(username);

    return this.wishesRepository.find({
      where: { owner: { id: user.id } },
      relations: ['owner'],
    });
  }
}
