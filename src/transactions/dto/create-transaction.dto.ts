import { Expose } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from "class-validator";

export class CreateTransactionDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsIn(["income", "expense"])
  type: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  category: string;

  @Expose()
  @IsString()
  @IsOptional()
  note?: string;
}
