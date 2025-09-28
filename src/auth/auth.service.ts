import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { CreateUserDto } from "src/users/dtos/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "src/database/database.service";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "src/users/dtos/user-response.dto";
import { User } from "@prisma/client";
import { EmailService } from "src/email/email.service";
import { Response } from "express";
import {
  SendVerificationDto,
  VerifyEmailDto,
} from "src/email/dtos/email-verification.dto";
import {
  BadRequestException,
  Headers,
  HttpException,
  HttpStatus,
  Injectable,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import {
  AuthResponse,
  EmailSendResponse,
  JwtPayload,
  OAuthUser,
} from "types/auth";

const {
  JWT_ACCESS_EXPIRES_IN = "15m",
  JWT_REFRESH_EXPIRES_IN = "7d",
  NODE_ENV,
} = process.env;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  private createAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      { ...payload, type: "access" },
      {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
      },
    );
  }

  private createRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      { ...payload, type: "refresh" },
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      },
    );
  }

  private sendAuthResponse(
    user: User,
    res: Response,
    isWeb = false,
  ): AuthResponse {
    const tokenPayload = { id: user.id, email: user.email };
    const accessToken = this.createAccessToken(tokenPayload);
    const refreshToken = this.createRefreshToken(tokenPayload);

    // WEB? Set HTTP-only cookies
    if (isWeb) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        partitioned: NODE_ENV === "production", // for io;
        maxAge: parseInt(JWT_REFRESH_EXPIRES_IN) * 24 * 60 * 60 * 1000, // 7 days
      });
      return {
        status: "success",
        accessToken,
        refreshToken: "",
        data: plainToInstance(UserResponseDto, user, {
          excludeExtraneousValues: true,
        }),
      };
    }
    return {
      status: "success",
      accessToken,
      refreshToken,
      data: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    // 1) Check if passwords match
    if (signupDto.password != signupDto.passwordConfirm) {
      throw new BadRequestException("Passwords do not match");
    }

    // 2) Check if user already exists
    const email = signupDto.email.trim().toLocaleLowerCase();
    const existingUser = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // 3) Hash password
    const hashedPassword = await bcrypt.hash(signupDto.password, 12);

    // 4) Clean signup specific props
    const cleanedData = plainToInstance(CreateUserDto, signupDto, {
      excludeExtraneousValues: true,
    });

    // 5) Create the user/tokens and send back;
    const user = await this.databaseService.user.create({
      data: {
        ...cleanedData,
        email,
        password: hashedPassword,
      },
    });

    try {
      await this.emailService.sendWelcomeEmail(email, user.fname);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    throw new HttpException(
      {
        message: "Please confirm your email to complete your registration",
        redirectTo: "/send-verification",
        payload: {
          email,
        },
      },
      HttpStatus.TEMPORARY_REDIRECT,
    );
  }

  async login(
    body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ): Promise<AuthResponse> {
    const email = body.email.toLocaleLowerCase().trim();
    const user = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password || ""))) {
      throw new BadRequestException("Incorrect email or password");
    } else if (!user.isActive) {
      throw new UnauthorizedException("Your account has been deactivated");
    } else if (!user.isEmailVerified) {
      throw new HttpException(
        {
          message: "Please verify your email before logging in",
          redirectTo: "/send-verification",
          payload: {
            email,
          },
        },
        HttpStatus.TEMPORARY_REDIRECT,
      );
    }

    return this.sendAuthResponse(user, res, platform === "web");
  }

  async refreshToken(
    refreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.databaseService.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return this.sendAuthResponse(user, res, platform === "web");
    } catch (_) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /** OAuth */

  async googleOAuth(
    oauthUser: OAuthUser,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ): Promise<AuthResponse> {
    return this.handleOAuthLogin(oauthUser, res, platform === "web");
  }

  async appleOAuth(
    oauthUser: OAuthUser,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ): Promise<AuthResponse> {
    return this.handleOAuthLogin(oauthUser, res, platform === "web");
  }

  private async handleOAuthLogin(
    oauthUser: OAuthUser,
    @Res({ passthrough: true }) res: Response,
    isWeb = false,
  ): Promise<AuthResponse> {
    // Check if user exists
    let user: User | null = await this.databaseService.user.findUnique({
      where: { email: oauthUser.email },
    });

    if (user && !user.isActive) {
      throw new UnauthorizedException("Your account has been deactivated");
    } else if (user) {
      const updateData: Record<string, any> = {};
      if (oauthUser.googleId && !user.googleId)
        updateData.googleId = oauthUser.googleId;
      if (oauthUser.appleId && !user.appleId)
        updateData.appleId = oauthUser.appleId;
      if (oauthUser.picture && !user.picture)
        updateData.picture = oauthUser.picture;

      if (Object.keys(updateData).length > 0) {
        user = await this.databaseService.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
      // send login attempt:
    } else {
      // otherwise, create a new user
      user = await this.databaseService.user.create({
        data: {
          email: oauthUser.email,
          fname: oauthUser.firstName,
          lname: oauthUser.lastName || "Wallet",
          googleId: oauthUser.googleId || null,
          appleId: oauthUser.appleId || null,
          picture: oauthUser.picture || null,
          isEmailVerified: oauthUser.isEmailVerified ?? true,
        },
      });

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(
          oauthUser.email,
          oauthUser.firstName,
        );
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    }

    return this.sendAuthResponse(user, res, isWeb);
  }

  /** email */

  private generateEmailVerificationToken(): { code: string; expires: Date } {
    // cryptographically 6-digit;
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    const code = ((randomNumber % 900000) + 100000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min;
    return { code, expires };
  }

  async sendVerificationEmail(
    body: SendVerificationDto,
  ): Promise<EmailSendResponse> {
    const normalizedEmail = body.email.trim().toLowerCase();
    const user = await this.databaseService.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestException("User with this email does not exist");
    } else if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    // Generate new verification token && save
    const { code, expires } = this.generateEmailVerificationToken();
    await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: code,
        emailVerificationTokenExpiresAt: expires,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        normalizedEmail,
        code,
        user.fname,
      );
    } catch (_) {
      throw new BadRequestException("Failed to send verification email");
    }

    return {
      status: "success",
      message: "Verification email sent successfully",
      data: {
        email: normalizedEmail,
        expiresIn: expires,
      },
    };
  }

  async verifyEmail(
    { email, code }: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
    @Headers("x-platform") platform: string,
  ): Promise<AuthResponse> {
    email = email.trim().toLowerCase();
    const user = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    } else if (
      !user.emailVerificationToken ||
      !user.emailVerificationTokenExpiresAt
    ) {
      throw new BadRequestException("No verification code found");
    } else if (user.emailVerificationTokenExpiresAt < new Date()) {
      throw new BadRequestException("Verification code has expired");
    } else if (user.emailVerificationToken !== code) {
      throw new BadRequestException("Invalid verification code");
    }

    const updatedUser: User = await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return this.sendAuthResponse(updatedUser, res, platform === "web");
  }
}
