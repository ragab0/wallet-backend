import { UserResponseDto } from "src/users/dtos/user-response";

export interface JwtPayload {
  id: string;
  email: string;
}

export interface RefreshTokenResponse {
  status: "success";
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  status: "success";
  accessToken: string;
  refreshToken: string;
  data: UserResponseDto;
}
