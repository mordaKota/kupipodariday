import { IsDecimal, Min, IsBoolean, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean = false;
}
