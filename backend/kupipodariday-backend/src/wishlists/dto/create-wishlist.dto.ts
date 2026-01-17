import {
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1500)
  description: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  itemsId?: number[];
}
