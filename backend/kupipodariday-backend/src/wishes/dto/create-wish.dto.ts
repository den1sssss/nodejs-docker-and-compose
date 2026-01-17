import {
  IsString,
  IsNumber,
  IsUrl,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsString()
  @IsUrl()
  link: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsNumber()
  @Min(0.01)
  @Max(1000000)
  price: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  description: string;
}
