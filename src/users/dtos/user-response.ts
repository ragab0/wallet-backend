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
  photo: string | null;
  @Expose()
  role: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
