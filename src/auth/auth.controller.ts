import { SignupDto } from "./dtos/signup.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { Public } from "./decorators/public.decorator";
import {
  GoogleOAuthTokenResponse,
  GoogleOAuthProfileExchange,
  OAuthUser,
} from "types/auth";
import { EmailService } from "src/email/email.service";
import { GoogleMobileOAuthDto } from "./dtos/oauth.dto";
import {
  AuthApiTags,
  LoginApiOperation,
  LoginApiBody,
  LoginApiResponses,
  RefreshTokenApiOperation,
  RefreshTokenApiHeader,
  RefreshTokenApiResponses,
  SendVerificationApiOperation,
  SendVerificationApiBody,
  VerifyEmailApiOperation,
  VerifyEmailApiBody,
  SignupApiOperation,
  SignupApiBody,
  SignupApiResponses,
} from "./docs/auth.swagger";
import {
  SendVerificationDto,
  VerifyEmailDto,
} from "src/email/dtos/email-verification.dto";
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import axios from "axios";
import { Request, Response } from "express";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

@AuthApiTags()
@Public()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @SignupApiOperation()
  @SignupApiBody()
  @SignupApiResponses()
  @HttpCode(201)
  @Post("signup")
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @LoginApiOperation()
  @LoginApiBody()
  @LoginApiResponses()
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ) {
    return await this.authService.login(body, res, platform);
  }

  @RefreshTokenApiOperation()
  @RefreshTokenApiHeader()
  @RefreshTokenApiResponses()
  @Post("refresh")
  @HttpCode(201)
  async refreshToken(
    @Headers("authorization") authHeader: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ) {
    const refreshToken =
      (req.cookies["refreshToken"] as string) ||
      authHeader?.replace("Bearer ", "");
    if (!refreshToken) throw new UnauthorizedException();

    return await this.authService.refreshToken(refreshToken, res, platform);
  }

  @SendVerificationApiOperation()
  @SendVerificationApiBody()
  @Post("send-verification")
  async sendVerification(@Body() body: SendVerificationDto) {
    return this.authService.sendVerificationEmail(body);
  }

  @VerifyEmailApiOperation()
  @VerifyEmailApiBody()
  @Post("verify-email")
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ) {
    return this.authService.verifyEmail(verifyEmailDto, res, platform);
  }
  // @Public()
  // @Get("verify-email/:token")
  // async verifyEmail2(@Param("token") token: string) {
  //   return this.authService.verifyEmail({ token });
  // }

  /** OAuth options */

  // @GoogleAuthApiOperation()
  // @Get("google")
  // @UseGuards(GoogleOAuthGuard)
  // async googleAuth(): Promise<void> {
  //   // Guard redirects to Google
  // }

  // @GoogleAuthCallbackApiOperation()
  // @Get("google/callback")
  // @UseGuards(GoogleOAuthGuard)
  // @Redirect()
  // async googleAuthRedirect(@Req() req: OAuthRequest) {
  //   try {
  //     const result = await this.authService.googleLogin(req.user);
  //     const redirectUrl =
  //       `${process.env.FRONTEND_URL}/auth/callback?` +
  //       `access_token=${result.accessToken}&` +
  //       `refresh_token=${result.refreshToken}&` +
  //       "status=success";
  //     return {
  //       url: redirectUrl,
  //       statusCode: 302,
  //     };
  //   } catch (_) {
  //     const errorUrl = `${process.env.FRONTEND_URL}/auth/callback?status=error&message=Authentication failed`;
  //     return {
  //       url: errorUrl,
  //       statusCode: 302,
  //     };
  //   }
  // }

  /** idToken way */
  // @Post("google/mobile")
  // async googleTokenAuth(@Body() body: GoogleMobileOAuthDto) {
  //   try {
  //     const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  //     const ticket = await client.verifyIdToken({
  //       idToken: body.code,
  //       audience: GOOGLE_CLIENT_ID,
  //     });
  //     const payload = ticket.getPayload();
  //     console.log("PAYLOAD IS:", payload);
  //     if (!payload || !payload.email) throw new Error("Invalid ID token");
  //     const user = {
  //       googleId: payload.sub,
  //       email: payload.email,
  //       firstName: payload.given_name || "User",
  //       lastName: payload.family_name,
  //       picture: payload.picture,
  //     };
  //     return await this.authService.googleOAuth(user);
  //   } catch (error) {
  //     console.log("error controller:", error);
  //     throw new Error("Authentication failed");
  //   }
  // }

  @Post("google/mobile")
  async googleTokenAuth(
    @Body() body: GoogleMobileOAuthDto,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ) {
    try {
      // exchange authorization code (of front-end) for tokens
      const tokenResponse = await axios.post<GoogleOAuthTokenResponse>(
        "https://oauth2.googleapis.com/token",
        {
          code: body.code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: body.redirectUri,
          grant_type: "authorization_code",
          code_verifier: body.codeVerifier,
        },
        {
          timeout: 10000, // 10 second timeout
        },
      );

      // get user info
      const userResponse = await axios.get<GoogleOAuthProfileExchange>(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
          },
        },
      );

      const user: OAuthUser = {
        googleId: userResponse.data.id,
        email: userResponse.data.email,
        firstName:
          userResponse.data.given_name || userResponse.data.name || "User",
        lastName: userResponse.data.family_name,
        picture: userResponse.data.picture,
        isEmailVerified: userResponse.data.verified_email ?? true,
      };

      return await this.authService.googleOAuth(user, res, platform);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Google OAuth error:", error.response?.data);
      }
      throw new BadRequestException("Authentication failed");
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
