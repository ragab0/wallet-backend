import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
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
  DeletePictureApiOperation,
  DeletePictureApiResponses,
  UploadPictureApiOperation,
  UploadPictureApiResponses,
  UploadPictureApiBody,
} from "./docs/users.swagger";

import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "src/auth/decorators/roles.decorator";

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

  /** Me routes - deleagte to user operations */

  @Get("me")
  @GetMeApiOperation()
  @GetMeApiResponses()
  getMe(@CurrentUser() user: User) {
    // return this.usersService.getMe(user);
    return this.usersService.findOne(user.id);
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

  @Post("me/picture")
  @UploadPictureApiOperation()
  @UploadPictureApiResponses()
  @UseInterceptors(FileInterceptor("picture"))
  @ApiConsumes("multipart/form-data")
  @UploadPictureApiBody()
  async uploadMyPicture(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Picture file is required");
    }

    console.log("my picture uploading is:", file);

    return this.usersService.uploadPicture(user.id, file);
  }

  @Delete("me/picture")
  @DeletePictureApiOperation()
  @DeletePictureApiResponses()
  async deleteMyPicture(@CurrentUser() user: User) {
    return this.usersService.deletePicture(user.id);
  }

  /** User routes */

  @Roles("ADMIN")
  @Get()
  @GetAllUsersApiOperation()
  @GetAllUsersApiResponses()
  async findAll() {
    return this.usersService.findAll();
  }

  @Roles("ADMIN")
  @Get(":id")
  @GetUserByIdApiOperation()
  @UserIdParam()
  @GetUserByIdApiResponses()
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Roles("ADMIN")
  @Patch(":id")
  @UpdateUserApiOperation()
  @UserIdParam()
  @UpdateUserApiBody()
  @UpdateUserApiResponses()
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Roles("ADMIN")
  @Delete(":id")
  @HttpCode(204)
  @DeleteUserApiOperation()
  @UserIdParam()
  @DeleteUserApiResponses()
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Roles("ADMIN")
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

  @Roles("ADMIN")
  @Patch(":id/picture")
  @UploadPictureApiOperation()
  @UserIdParam()
  @UploadPictureApiResponses()
  @UseInterceptors(FileInterceptor("picture"))
  @ApiConsumes("multipart/form-data")
  @UploadPictureApiBody()
  async uploadPicture(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Picture file is required");
    }

    return this.usersService.uploadPicture(id, file);
  }

  @Roles("ADMIN")
  @Delete(":id/picture")
  @DeletePictureApiOperation()
  @UserIdParam()
  @DeletePictureApiResponses()
  async deletePicture(@Param("id") id: string) {
    return this.usersService.deletePicture(id);
  }
}
