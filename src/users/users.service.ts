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
    const user = (await this.databaseService.user.create({
      data: createUserDto,
      select,
    })) as UserResponseDto;
    return user;
  }

  async findAll() {
    return await this.databaseService.user.findMany({
      where: {
        isActive: true,
      },
      select,
    });
  }

  async findOne(id: string) {
    return await this.databaseService.user.findUnique({
      where: {
        id,
      },
      select,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select,
    });
  }

  async remove(id: string) {
    return await this.databaseService.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select,
    });
  }
}
