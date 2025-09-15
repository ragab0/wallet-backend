import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { GoogleProfile, OAuthResponse, OAuthUser } from "types/auth";

const {
  GOOGLE_CLIENT_ID = "",
  GOOGLE_CLIENT_SECRET = "",
  GOOGLE_CALLBACK_URL = "",
} = process.env;

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos, id } = profile;
    const user: OAuthUser = {
      googleId: id || "",
      email: emails[0].value,
      firstName: name.givenName || "Google",
      lastName: name.familyName || "User",
      picture: photos[0].value,
    };

    const response: OAuthResponse = {
      accessToken,
      refreshToken,
      user,
    };

    done(null, response);
  }
}
