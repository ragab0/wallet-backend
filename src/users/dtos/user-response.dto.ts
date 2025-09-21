import { Role } from "@prisma/client";
import { Expose } from "class-transformer";

export class UserResponseDto {
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  fname: string;
  @Expose()
  lname: string;
  @Expose()
  picture?: string;
  @Expose()
  role: Role;
  @Expose()
  isActive: boolean;
  @Expose()
  isEmailVerified: boolean;

  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
