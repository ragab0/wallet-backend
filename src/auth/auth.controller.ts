import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Redirect,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SignupDto } from "./dtos/signup.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User as PrismaUser } from "@prisma/client";
import { Public } from "./decorators/public.decorator";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard";
import { OAuthUser } from "types/auth";

interface OAuthRequest extends Request {
  user: OAuthUser;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(201)
  @Post("signup")
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @Public()
  @Post("login")
  async login(@Body() body: LoginDto, @CurrentUser() user: PrismaUser) {
    console.log(user);
    return await this.authService.login(body);
  }

  @Post("refresh")
  @HttpCode(201)
  async refreshToken(@Headers("authorization") authHeader: string) {
    const refreshToken = authHeader?.replace("Bearer ", "");
    return await this.authService.refreshToken(refreshToken);
  }

  // Google OAuth routes
  @Public()
  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(): Promise<void> {
    // Guard redirects to Google
  }

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleOAuthGuard)
  @Redirect()
  async googleAuthRedirect(@Req() req: OAuthRequest) {
    try {
      const result = await this.authService.googleLogin(req.user);
      const redirectUrl =
        `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${result.accessToken}&` +
        `refresh_token=${result.refreshToken}&` +
        "status=success";

      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (_) {
      const errorUrl = `${process.env.FRONTEND_URL}/auth/callback?status=error&message=Authentication failed`;
      return {
        url: errorUrl,
        statusCode: 302,
      };
    }
  }

  // Apple OAuth
  // @Public()
  // @Get("apple")
  // @UseGuards(AppleOAuthGuard)
  // async appleAuth(): Promise<void> {
  //   // Redirects to Apple
  // }

  // @Public()
  // @Post("apple/callback")
  // @UseGuards(AppleOAuthGuard)
  // async appleAuthRedirect(@Req() req: OAuthRequest) {
  //   try {
  //     const result = await this.authService.appleLogin(req.user);
  //     return result;
  //   } catch (_) {
  //     throw new BadRequestException("Apple authentication failed");
  //   }
  // }
}
