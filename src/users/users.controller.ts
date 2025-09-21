import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto, UpdateUserPasswordDto } from "./dtos/update-user.dto";
import { User } from "@prisma/client";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this.usersService.create(body);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  /** Me routes */

  @Get("me")
  getMe(@CurrentUser() user: User) {
    // return this.usersService.getMe(user);
    return this.usersService.findOne(user.id); // to not break our pattern - delegate
  }

  @Patch("me")
  async updateMe(@CurrentUser() user: User, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.id, body);
  }

  @Delete("me")
  @HttpCode(204)
  async removeMe(@CurrentUser() user: User) {
    return this.usersService.remove(user.id);
  }

  @Patch("me/password")
  async changeMyPassword(
    @CurrentUser() user: User,
    @Body() body: UpdateUserPasswordDto,
  ) {
    return this.usersService.changePassword(user.id, body);
  }

  /** User routes */

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  // User routes (specific fields [password, picture, role, email])

  @Patch(":id/password")
  async changePassword(
    @Param("id") id: string,
    @Body() body: UpdateUserPasswordDto,
  ) {
    return this.usersService.changePassword(id, body);
  }
}
