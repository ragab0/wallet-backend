import { Body, Controller, Post } from "@nestjs/common";
import { SignupDto } from "./dtos/signup.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    this.authService.login(body);
  }

  @Post("logout")
  logout() {}
}
