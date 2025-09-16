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
import {
  SendVerificationDto,
  VerifyEmailDto,
} from "src/email/dtos/email-verification.dto";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  AuthResponse,
  EmailSendResponse,
  JwtPayload,
  OAuthUser,
} from "types/auth";

const { JWT_ACCESS_EXPIRES_IN = "15m", JWT_REFRESH_EXPIRES_IN = "7d" } =
  process.env;

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

  private sendAuthResponse(user: User): AuthResponse {
    const tokenPayload = { id: user.id, email: user.email };
    const accessToken = this.createAccessToken(tokenPayload);
    const refreshToken = this.createRefreshToken(tokenPayload);
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

    return this.sendAuthResponse(user);
  }

  async login(body: LoginDto): Promise<AuthResponse> {
    const user = await this.databaseService.user.findUnique({
      where: {
        email: body.email.toLocaleLowerCase().trim(),
      },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password || ""))) {
      throw new BadRequestException("Incorrect email or password");
    } else if (!user.isActive) {
      throw new UnauthorizedException("Your account has been deactivated");
    } else if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        "Please verify your email before logging in",
      );
    }

    return this.sendAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
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

      return this.sendAuthResponse(user);
    } catch (_) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /** Passport auth */

  async googleLogin(oauthUser: OAuthUser): Promise<AuthResponse> {
    return this.handleOAuthLogin(oauthUser);
  }

  async appleLogin(oauthUser: OAuthUser): Promise<AuthResponse> {
    return this.handleOAuthLogin(oauthUser);
  }

  private async handleOAuthLogin(oauthUser: OAuthUser): Promise<AuthResponse> {
    // Check if user exists
    const whereConditions: Record<string, any>[] = [{ email: oauthUser.email }];

    if (oauthUser.googleId)
      whereConditions.push({ googleId: oauthUser.googleId });
    else if (oauthUser.appleId)
      whereConditions.push({ appleId: oauthUser.appleId });

    let user: User | null = await this.databaseService.user.findFirst({
      where: { OR: whereConditions },
    });

    // If user exists, update missing OAuth IDs or picture
    if (user) {
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
    }
    // otherwise, create a new user
    else {
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

    if (!user.isActive) {
      throw new UnauthorizedException("Your account has been deactivated");
    }

    return this.sendAuthResponse(user);
  }

  /** email */

  private generateEmailVerificationToken(): { token: string; expires: Date } {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes;
    return { token, expires };
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
    const { token, expires } = this.generateEmailVerificationToken();
    await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: expires,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        normalizedEmail,
        token,
        user.fname,
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new BadRequestException("Failed to send verification email");
    }

    return {
      status: "success",
      message: "Verification email sent successfully",
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponse> {
    const { token } = verifyEmailDto;
    const user: User | null = await this.databaseService.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    const updatedUser: User = await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    return this.sendAuthResponse(updatedUser);
  }
}
