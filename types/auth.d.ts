import { Profile } from "passport-google-oauth20";
import { UserResponseDto } from "src/users/dtos/user-response.dto";

export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
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

export interface GoogleOAuthTokenResponse {
  access_token: string;
  id_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface GoogleOAuthProfileExchange {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
  name?: string;
}

export interface GoogleProfilePassport extends Profile {
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
