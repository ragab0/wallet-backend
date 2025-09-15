import { Body, Controller, Headers, HttpCode, Post } from "@nestjs/common";
import { SignupDto } from "./dtos/signup.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User as PrismaUser } from "@prisma/client";
import { Public } from "./decorators/public.decorator";

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
}
