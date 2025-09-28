import { IsString } from "class-validator";

export class GoogleMobileOAuthDto {
  @IsString({ message: "Code is required" })
  code: string;

  @IsString({ message: "Redirect URI is required" })
  redirectUri: string;

  @IsString({ message: "Code Verifier is required" })
  codeVerifier: string;
}
