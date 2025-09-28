import {
  BadRequestException,
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
import { CloudinaryService } from "./services/cloudinary.service";
import { UploadApiErrorResponse } from "cloudinary";

const select = Object.entries(new UserResponseDto()).reduce((prev, [k]) => {
  prev[k] = true;
  return prev;
}, {});

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  /** avatar */

  async uploadPicture(id: string, file: Express.Multer.File) {
    // Validate file type && size;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      throw new BadRequestException("Only JPEG and PNG images are allowed");
    } else if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException("File size must be less than 5MB");
    }

    // Check if user exists
    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: { id: true, picture: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    try {
      // Delete old avatar if exists
      if (user.picture) {
        await this.cloudinaryService.deleteImage(user.picture);
      }
      const uploadResult = await this.cloudinaryService
        .uploadPicture(file)
        .catch((error: Error & UploadApiErrorResponse) => {
          throw new BadRequestException(
            error.message || "Failed to upload avatar",
          );
        });

      const updatedUser = await this.databaseService.user.update({
        where: { id },
        data: { picture: uploadResult.secure_url },
        select,
      });

      return updatedUser;
    } catch (_) {
      throw new BadRequestException("Failed to upload avatar");
    }
  }

  async deletePicture(id: string) {
    // Check if user exists
    const user = (await this.databaseService.user.findUnique({
      where: { id },
      select,
    })) as User;

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.picture) {
      throw new BadRequestException("User has no avatar to delete");
    }

    try {
      await this.cloudinaryService.deleteImage(user.picture);
      await this.databaseService.user.update({
        where: { id },
        data: { picture: null },
        select,
      });

      return;
    } catch (_) {
      throw new BadRequestException("Failed to delete avatar");
    }
  }
}
