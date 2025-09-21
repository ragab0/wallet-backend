import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Role, User } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
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
import {
  CreateTransactionApiOperation,
  CreateTransactionApiBody,
  CreateTransactionApiResponses,
  GetAllTransactionsApiOperation,
  GetAllTransactionsApiQuery,
  GetAllTransactionsApiResponses,
  GetTransactionByIdApiOperation,
  TransactionIdParam,
  GetTransactionByIdApiResponses,
  UpdateTransactionApiOperation,
  UpdateTransactionApiBody,
  UpdateTransactionApiResponses,
  DeleteTransactionApiOperation,
  DeleteTransactionApiResponses,
} from "./docs/transactions.swagger";

/**
 * Controller for handling transaction-related HTTP requests.
 * Provides endpoints for creating, reading, updating, and deleting transactions.
 *
 * @remarks
 * - Normal users can only access their own transactions
 * - Admins can access all transactions and filter by user ID
 */
@ApiTags("Transactions")
@ApiBearerAuth()
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @CreateTransactionApiOperation()
  @CreateTransactionApiBody()
  @CreateTransactionApiResponses()
  create(
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const userId =
      user.role === Role.ADMIN ? createTransactionDto.userId : user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  @GetAllTransactionsApiOperation()
  @GetAllTransactionsApiQuery()
  @GetAllTransactionsApiResponses()
  async findAll(@CurrentUser() user: User, @Query("userId") userId?: string) {
    if (user.role === Role.ADMIN && userId)
      return this.transactionsService.findAll(userId);
    return this.transactionsService.findAll(user.id);
  }

  @Get(":id")
  @GetTransactionByIdApiOperation()
  @TransactionIdParam()
  @GetTransactionByIdApiResponses()
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
  @UpdateTransactionApiOperation()
  @TransactionIdParam()
  @UpdateTransactionApiBody()
  @UpdateTransactionApiResponses()
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
  @DeleteTransactionApiOperation()
  @TransactionIdParam()
  @DeleteTransactionApiResponses()
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
