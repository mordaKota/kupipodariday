import { Min, IsBoolean, IsOptional, IsInt, IsNumber } from 'class-validator';

export class CreateOfferDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean = false;

  @IsInt()
  itemId: number;
}
