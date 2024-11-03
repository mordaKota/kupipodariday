import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { IsDecimal, IsUrl, Length } from 'class-validator';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  @Length(1, 250)
  name: string;

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsDecimal()
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsDecimal()
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @Column({ length: 1024 })
  @Length(1, 1024)
  description: string;

  @ManyToMany(() => Offer)
  @JoinTable()
  offers: Offer[];

  @Column('int', { default: 0 })
  copied: number;
}
