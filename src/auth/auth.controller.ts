import { Body, Controller, Headers, Post } from "@nestjs/common";
import { SignupDto } from "./dtos/signup.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { UserDec } from "./decorators/current-user.decorator";
import { User as PrismaUser } from "@prisma/client";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @Post("login")
  async login(@Body() body: LoginDto, @UserDec() user: PrismaUser) {
    console.log(user);
    return await this.authService.login(body);
  }

  @Post("refresh")
  async refreshToken(@Headers("authorization") authHeader: string) {
    const refreshToken = authHeader?.replace("Bearer ", "");
    return await this.authService.refreshToken(refreshToken);
  }
}
