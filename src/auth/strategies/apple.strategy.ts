import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "@arendajaelu/nestjs-passport-apple";
import { AuthService } from "../auth.service";
import { ApplePayload, OAuthUser } from "types/auth";

const {
  APPLE_CLIENT_ID = "",
  APPLE_TEAM_ID = "",
  APPLE_CALLBACK_URL,
  APPLE_KEY_ID = "",
  APPLE_PRIVATE_KEY = "",
} = process.env;

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, "apple") {
  constructor(private authService: AuthService) {
    super({
      clientID: APPLE_CLIENT_ID,
      teamID: APPLE_TEAM_ID,
      callbackURL: APPLE_CALLBACK_URL,
      keyID: APPLE_KEY_ID,
      key: APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      passReqToCallback: false,
      scope: ["name", "email"],
    });
  }

  validate(payload: ApplePayload): OAuthUser {
    const { sub, email, name } = payload;
    return {
      appleId: sub,
      email: email,
      firstName: name?.firstName || "Apple",
      lastName: name?.lastName || "User",
      isEmailVerified: true,
    };
  }
}
