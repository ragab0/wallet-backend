import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Reflector } from "@nestjs/core";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard";
import { AppleOAuthGuard } from "./guards/apple-oauth.guard";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    Reflector,
    JwtAuthGuard,
    RolesGuard,

    GoogleOAuthGuard,
    AppleOAuthGuard,
    GoogleStrategy,
    // AppleStrategy,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
