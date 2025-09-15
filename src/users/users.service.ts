import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto, UpdateUserPasswordDto } from "./dtos/update-user.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";

const select = Object.entries(new UserResponseDto()).reduce((prev, [k]) => {
  prev[k] = true;
  return prev;
}, {});

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  @HttpCode(201)
  async create(createUserDto: CreateUserDto) {
    return (await this.databaseService.user.create({
      data: {
        ...createUserDto,
        email: createUserDto.email.trim().toLocaleLowerCase(),
      },
      select,
    })) as User;
  }

  async findAll() {
    return (await this.databaseService.user.findMany({
      where: {
        isActive: true,
      },
      select,
    })) as User[];
  }

  async findOne(id: string) {
    return (await this.databaseService.user.findUnique({
      where: {
        id,
      },
      select,
    })) as User | null;
  }

  async update(id: string, body: UpdateUserDto) {
    return (await this.databaseService.user.update({
      where: {
        id,
      },
      data: body,
      select,
    })) as User;
  }

  async remove(id: string) {
    await this.databaseService.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select,
    });
  }

  async changePassword(
    id: string,
    { currentPassword, newPassword, confirmPassword }: UpdateUserPasswordDto,
  ) {
    if (newPassword !== confirmPassword) {
      throw new HttpException(
        "New password and confirm password do not match",
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: { ...select, password: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid =
      user.password && (await bcrypt.compare(currentPassword, user.password));
    if (!isPasswordValid) {
      throw new HttpException(
        "Current password is incorrect",
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedUser = (await this.databaseService.user.update({
      where: { id },
      data: { password: hashedPassword },
      select,
    })) as User;

    return updatedUser;
  }

  /** ME routes (delegated to ^^) */
  // getMe(user: User): UserResponseDto {
  //   const userData = plainToClass(UserResponseDto, user, {
  //     excludeExtraneousValues: true,
  //   });
  //   return userData;
  // }
}
