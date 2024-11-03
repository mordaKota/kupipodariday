import { IsString, IsUrl, Length, IsOptional, IsArray } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 1500)
  description?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsArray()
  items: number[];
}
