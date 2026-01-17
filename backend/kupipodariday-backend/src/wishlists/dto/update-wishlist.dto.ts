import {
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  itemsId?: number[];
}
