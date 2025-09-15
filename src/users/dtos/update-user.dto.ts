import { OmitType, PartialType } from "@nestjs/mapped-types";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ["email", "password"] as const),
) {
  @IsOptional()
  @IsEnum(["USER"], {
    message: "Role must be USER",
  })
  role?: "USER";
}

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: "Current password is required" })
  @IsString({ message: "Current password must be a string" })
  currentPassword: string;

  @IsNotEmpty({ message: "New password is required" })
  @IsString({ message: "New password must be a string" })
  @MinLength(8, { message: "New password must be at least 8 characters long" })
  newPassword: string;

  @IsNotEmpty({ message: "Please confirm your new password" })
  @IsString({ message: "Confirm password must be a string" })
  confirmPassword: string;
}
