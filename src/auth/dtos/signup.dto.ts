import { OmitType } from "@nestjs/mapped-types";
import { IsString, MinLength } from "class-validator";
import { CreateUserDto } from "src/users/dtos/create-user.dto";

export class SignupDto extends OmitType(CreateUserDto, ["password"] as const) {
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @IsString({ message: "Password confirm must be a string" })
  @MinLength(8, {
    message: "Password confirm must be at least 8 characters long",
  })
  passwordConfirm: string;
}
