import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { Role, User } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";

/**
 *  // Normal user → force their own ID
 *  // For admin, only use the transaction ID
 *  // For normal users, include their user ID in the query
 *
 */

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const userId =
      user.role === Role.ADMIN ? createTransactionDto.userId : user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User, @Query("userId") userId?: string) {
    if (user.role === Role.ADMIN && userId)
      return this.transactionsService.findAll(userId);
    return this.transactionsService.findAll(user.id);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: User) {
    const transaction = await this.transactionsService.findOne(
      id,
      user.role === Role.ADMIN ? undefined : user.id,
    );

    if (!transaction) {
      throw new ForbiddenException(
        "Transaction not found or you don't have permission to access it",
      );
    }

    return transaction;
  }

  @Roles(Role.ADMIN)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    const existingTransaction = await this.transactionsService.findOne(id);

    if (!existingTransaction) {
      throw new ForbiddenException("Transaction not found");
    }

    return this.transactionsService.update(id, updateTransactionDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    const existingTransaction = await this.transactionsService.findOne(
      id,
      user.role === Role.ADMIN ? undefined : user.id,
    );

    if (!existingTransaction) {
      throw new ForbiddenException(
        "Transaction not found or you don't have permission to delete it",
      );
    }

    return this.transactionsService.remove(id);
  }
}
