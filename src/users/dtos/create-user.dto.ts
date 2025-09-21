import { Expose } from "class-transformer";
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreateUserDto {
  @Expose()
  @IsString({ message: "First name must be a string" })
  @MinLength(1, { message: "First name is required" })
  @MaxLength(50, { message: "First name must not exceed 50 characters" })
  fname: string;

  @Expose()
  @IsString({ message: "Last name must be a string" })
  @MinLength(1, { message: "Last name is required" })
  @MaxLength(50, { message: "Last name must not exceed 50 characters" })
  lname: string;

  @Expose()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @Expose()
  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password?: string;

  @Expose()
  @IsOptional()
  picture?: string;
}
