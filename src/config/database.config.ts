import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { Wishlist } from '../wishlists/entities/wishlist.entity';
import { Offer } from '../offers/entities/offer.entity';

export default () => ({
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, Wish, Wishlist, Offer],
    synchronize: false,
    logging: true,
    timeZone: 'SYSTEM',
  },
});
