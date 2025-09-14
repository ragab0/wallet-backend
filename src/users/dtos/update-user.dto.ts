import { OmitType, PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional } from "class-validator";
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
