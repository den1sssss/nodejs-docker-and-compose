import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateOfferDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Max(1000000, { message: 'Amount must be less than 1000000' })
  amount: number;

  @IsOptional()
  @IsBoolean({ message: 'Hidden must be a boolean' })
  hidden?: boolean;
}
