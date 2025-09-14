export class UserResponseDto {
  id: string;
  email: string;
  fname: string;
  lname: string;
  photo: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
