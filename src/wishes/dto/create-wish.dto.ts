import { IsString, IsUrl, Length, IsDecimal, Min } from 'class-validator';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
