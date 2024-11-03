import { IsString, IsEmail, Length, IsUrl, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  username: string;

  @IsString()
  @IsOptional()
  @Length(2, 200)
  about?: string = 'Пока ничего не рассказал о себе';

  @IsUrl()
  @IsOptional()
  avatar?: string = 'https://i.pravatar.cc/300';

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
