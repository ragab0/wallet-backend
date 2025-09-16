import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
