import { UserResponseDto } from "src/users/dtos/user-response";

export interface JwtPayload {
  id: string;
  passwordChangedAt: Date | null;
}

export interface JwtResponse {
  status: "success";
  token: string;
  data: UserResponseDto;
}
