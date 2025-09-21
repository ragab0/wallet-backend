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
import { Public } from "./decorators/public.decorator";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard";
import { OAuthUser } from "types/auth";
import { EmailService } from "src/email/email.service";
import {
  SendVerificationDto,
  VerifyEmailDto,
} from "src/email/dtos/email-verification.dto";

interface OAuthRequest extends Request {
  user: OAuthUser;
}

@Public()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @HttpCode(201)
  @Post("signup")
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Post("refresh")
  @HttpCode(201)
  async refreshToken(@Headers("authorization") authHeader: string) {
    const refreshToken = authHeader?.replace("Bearer ", "");
    return await this.authService.refreshToken(refreshToken);
  }

  @Post("send-verification")
  async sendVerification(@Body() body: SendVerificationDto) {
    return this.authService.sendVerificationEmail(body);
  }

  @Post("verify-email")
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }
  // @Public()
  // @Get("verify-email/:token")
  // async verifyEmail2(@Param("token") token: string) {
  //   return this.authService.verifyEmail({ token });
  // }

  // Google OAuth routes
  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(): Promise<void> {
    // Guard redirects to Google
  }

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
  // @Get("apple")
  // @UseGuards(AppleOAuthGuard)
  // async appleAuth(): Promise<void> {
  //   // Redirects to Apple
  // }

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
