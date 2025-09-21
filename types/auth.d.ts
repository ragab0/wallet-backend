import { Profile } from "passport-google-oauth20";
import { UserResponseDto } from "src/users/dtos/user-response.dto";

export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
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

export interface EmailSendResponse {
  status: "success";
  message: string;
  data: {
    email: string;
    expiresIn: date;
  };
}

export interface OAuthUser {
  googleId?: string;
  appleId?: string;
  firstName: string;
  lastName?: string;
  email: string;
  picture?: string;
  isEmailVerified?: boolean;
}

export interface OAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: OAuthUser;
}

export interface GoogleProfile extends Profile {
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
}

export interface ApplePayload {
  sub: string;
  email: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}
