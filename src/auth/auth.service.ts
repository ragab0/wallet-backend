import { BadRequestException, Injectable } from "@nestjs/common";
import { SignupDto } from "./dtos/signup.dto";
import { UsersService } from "src/users/users.service";
import { LoginDto } from "./dtos/login.dto";
import { CreateUserDto } from "src/users/dtos/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload, JwtResponse } from "types/auth";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServices: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private createToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  async signup(body: SignupDto): Promise<JwtResponse> {
    if (body.password != body.passwordConfirm) {
      throw new BadRequestException("Passwords do not match");
    }

    const { passwordConfirm: _, ...rest } = body;
    const userBody: CreateUserDto = rest;
    const user = await this.usersServices.create(userBody);

    const token = this.createToken({
      id: user.id,
      passwordChangedAt: user.passwordLastChangedAt,
    });

    return {
      status: "success",
      token,
      data: user,
    };
  }

  login(body: LoginDto) {
    console.log(body);
  }
}
