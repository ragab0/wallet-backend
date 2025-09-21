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
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto, UpdateUserPasswordDto } from "./dtos/update-user.dto";
import { User } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
// Role-based access control imports are kept for future use
// import { Roles } from "../auth/decorators/roles.decorator";
// import { Role } from "@prisma/client";
import {
  CreateUserApiOperation,
  CreateUserApiBody,
  CreateUserApiResponses,
  GetAllUsersApiOperation,
  GetAllUsersApiResponses,
  GetMeApiOperation,
  GetMeApiResponses,
  UpdateMeApiOperation,
  UpdateMeApiBody,
  UpdateMeApiResponses,
  DeleteMeApiOperation,
  DeleteMeApiResponses,
  ChangeMyPasswordApiOperation,
  ChangeMyPasswordApiBody,
  ChangeMyPasswordApiResponses,
  GetUserByIdApiOperation,
  UserIdParam,
  GetUserByIdApiResponses,
  UpdateUserApiOperation,
  UpdateUserApiBody,
  UpdateUserApiResponses,
  DeleteUserApiOperation,
  DeleteUserApiResponses,
  ChangeUserPasswordApiOperation,
  ChangeUserPasswordApiBody,
  ChangeUserPasswordApiResponses,
} from "./docs/users.swagger";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CreateUserApiOperation()
  @CreateUserApiBody()
  @CreateUserApiResponses()
  async create(@Body() body: CreateUserDto) {
    return await this.usersService.create(body);
  }

  @Get()
  @GetAllUsersApiOperation()
  @GetAllUsersApiResponses()
  async findAll() {
    return this.usersService.findAll();
  }

  /** Me routes */

  @Get("me")
  @GetMeApiOperation()
  @GetMeApiResponses()
  getMe(@CurrentUser() user: User) {
    // return this.usersService.getMe(user);
    return this.usersService.findOne(user.id); // to not break our pattern - delegate
  }

  @Patch("me")
  @UpdateMeApiOperation()
  @UpdateMeApiBody()
  @UpdateMeApiResponses()
  async updateMe(@CurrentUser() user: User, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.id, body);
  }

  @Delete("me")
  @HttpCode(204)
  @DeleteMeApiOperation()
  @DeleteMeApiResponses()
  async removeMe(@CurrentUser() user: User) {
    return this.usersService.remove(user.id);
  }

  @Patch("me/password")
  @ChangeMyPasswordApiOperation()
  @ChangeMyPasswordApiBody()
  @ChangeMyPasswordApiResponses()
  async changeMyPassword(
    @CurrentUser() user: User,
    @Body() body: UpdateUserPasswordDto,
  ) {
    return this.usersService.changePassword(user.id, body);
  }

  /** User routes */

  @Get(":id")
  @GetUserByIdApiOperation()
  @UserIdParam()
  @GetUserByIdApiResponses()
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UpdateUserApiOperation()
  @UserIdParam()
  @UpdateUserApiBody()
  @UpdateUserApiResponses()
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  @DeleteUserApiOperation()
  @UserIdParam()
  @DeleteUserApiResponses()
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  // User routes (specific fields [password, picture, role, email])

  @Patch(":id/password")
  @ChangeUserPasswordApiOperation()
  @UserIdParam()
  @ChangeUserPasswordApiBody()
  @ChangeUserPasswordApiResponses()
  async changePassword(
    @Param("id") id: string,
    @Body() body: UpdateUserPasswordDto,
  ) {
    return this.usersService.changePassword(id, body);
  }
}
