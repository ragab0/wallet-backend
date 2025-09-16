import { HttpCode, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class TransactionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  @HttpCode(201)
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    return await this.databaseService.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return await this.databaseService.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const where: { id: string; userId?: string } = { id };
    if (userId) {
      where.userId = userId;
    }

    return await this.databaseService.transaction.findUnique({
      where,
    });
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const updatedTransaction = await this.databaseService.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });

    return {
      status: "success",
      message: "Transaction updated successfully",
      data: updatedTransaction,
    };
  }

  async remove(id: string) {
    return await this.databaseService.transaction.delete({
      where: { id },
    });
  }
}
