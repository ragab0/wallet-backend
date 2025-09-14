/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreateUserDto {
  @IsString({ message: "First name must be a string" })
  @MinLength(1, { message: "First name is required" })
  @MaxLength(50, { message: "First name must not exceed 50 characters" })
  fname: string;

  @IsString({ message: "Last name must be a string" })
  @MinLength(1, { message: "Last name is required" })
  @MaxLength(50, { message: "Last name must not exceed 50 characters" })
  lname: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password?: string;

  @IsOptional()
  photo?: string;
}
