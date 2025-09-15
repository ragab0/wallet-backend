import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserResponseDto } from "./dtos/user-response";

const select = Object.entries(new UserResponseDto()).reduce((prev, [k]) => {
  prev[k] = true;
  return prev;
}, {});

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return (await this.databaseService.user.create({
      data: {
        ...createUserDto,
        email: createUserDto.email.trim().toLocaleLowerCase(),
      },
      select,
    })) as UserResponseDto;
  }

  async findAll(): Promise<UserResponseDto[]> {
    return (await this.databaseService.user.findMany({
      where: {
        isActive: true,
      },
      select,
    })) as UserResponseDto[];
  }

  async findOne(id: string): Promise<UserResponseDto> {
    return (await this.databaseService.user.findUnique({
      where: {
        id,
      },
      select,
    })) as UserResponseDto;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return (await this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select,
    })) as UserResponseDto;
  }

  async remove(id: string): Promise<UserResponseDto> {
    return (await this.databaseService.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select,
    })) as UserResponseDto;
  }
}
