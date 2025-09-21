import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { applyDecorators, HttpStatus } from "@nestjs/common";
import { CreateTransactionDto } from "../dto/create-transaction.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";

// Transaction Response Schema
const TransactionResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
    userId: { type: "string", example: "660e8400-e29b-41d4-a716-446655440000" },
    amount: { type: "number", example: 150.5 },
    title: { type: "string", example: "Grocery Shopping" },
    type: { type: "string", enum: ["income", "expense"], example: "expense" },
    category: { type: "string", example: "Food & Dining" },
    note: {
      type: "string",
      nullable: true,
      example: "Weekly grocery shopping at Walmart",
    },
    createdAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
    updatedAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
  },
};

// Common responses
const CommonResponses = {
  Unauthorized: ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized - Missing or invalid token",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Access token is required" },
        error: { type: "string", example: "Unauthorized" },
      },
    },
  }),
  Forbidden: ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      "Forbidden - Insufficient permissions or resource not accessible",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 403 },
        message: {
          type: "string",
          examples: [
            "Transaction not found or you don't have permission to access it",
            "Transaction not found or you don't have permission to delete it",
            "Transaction not found",
          ],
        },
        error: { type: "string", example: "Forbidden" },
      },
    },
  }),
  BadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad Request - Invalid input data",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "Validation failed" },
        error: { type: "string", example: "Bad Request" },
      },
    },
  }),
  NotFound: ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Not Found - Resource not found",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "Transaction not found" },
        error: { type: "string", example: "Not Found" },
      },
    },
  }),
};

// Transactions Controller Documentation
export const TransactionsApiTags = () =>
  applyDecorators(
    ApiTags("Transactions"),
    ApiBearerAuth(),
    CommonResponses.Unauthorized,
  );

// Create Transaction Endpoint
export const CreateTransactionApiOperation = () =>
  ApiOperation({
    summary: "Create a new transaction",
    description:
      "Creates a new transaction. Normal users can only create transactions for themselves. " +
      "Admins can create transactions for any user by specifying userId.",
  });

export const CreateTransactionApiBody = () =>
  ApiBody({
    type: CreateTransactionDto,
    description: "Transaction details",
    examples: {
      incomeTransaction: {
        summary: "Income transaction",
        value: {
          userId: "660e8400-e29b-41d4-a716-446655440000",
          amount: 1500.75,
          title: "Monthly Salary",
          type: "income",
          category: "Salary",
          note: "September 2024 salary",
        },
      },
      expenseTransaction: {
        summary: "Expense transaction",
        value: {
          userId: "660e8400-e29b-41d4-a716-446655440000",
          amount: 125.99,
          title: "Grocery Shopping",
          type: "expense",
          category: "Food & Dining",
          note: "Weekly groceries at Walmart",
        },
      },
    },
  });

export const CreateTransactionApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "Transaction created successfully",
      schema: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: TransactionResponseSchema,
        },
      },
    }),
    CommonResponses.BadRequest,
    CommonResponses.Unauthorized,
    CommonResponses.Forbidden,
  );

// Get All Transactions Endpoint
export const GetAllTransactionsApiOperation = () =>
  ApiOperation({
    summary: "Get all transactions",
    description:
      "Retrieves all transactions. Admins can see all transactions, users can only see their own.",
  });

export const GetAllTransactionsApiQuery = () =>
  applyDecorators(
    ApiQuery({
      name: "page",
      required: false,
      type: Number,
      description: "Page number for pagination (default: 1)",
      example: 1,
    }),
    ApiQuery({
      name: "limit",
      required: false,
      type: Number,
      description: "Number of items per page (default: 10, max: 100)",
      example: 10,
    }),
    ApiQuery({
      name: "type",
      required: false,
      enum: ["income", "expense"],
      description: "Filter by transaction type",
    }),
    ApiQuery({
      name: "category",
      required: false,
      type: String,
      description: "Filter by category name",
    }),
    ApiQuery({
      name: "startDate",
      required: false,
      type: Date,
      description: "Filter transactions after this date (ISO format)",
      example: "2024-01-01T00:00:00.000Z",
    }),
    ApiQuery({
      name: "endDate",
      required: false,
      type: Date,
      description: "Filter transactions before this date (ISO format)",
      example: "2024-12-31T23:59:59.999Z",
    }),
  );

export const GetAllTransactionsApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "List of transactions retrieved successfully",
      schema: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          results: { type: "number", example: 42 },
          data: {
            type: "array",
            items: TransactionResponseSchema,
          },
        },
      },
    }),
    CommonResponses.Unauthorized,
  );

// Get Transaction by ID Endpoint
export const GetTransactionByIdApiOperation = () =>
  ApiOperation({
    summary: "Get transaction by ID",
    description:
      "Retrieves a specific transaction by its ID. Users can only access their own transactions.",
  });

export const TransactionIdParam = () =>
  ApiParam({
    name: "id",
    description: "Transaction ID (UUID)",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: String,
  });

export const GetTransactionByIdApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Transaction retrieved successfully",
      schema: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: TransactionResponseSchema,
        },
      },
    }),
    CommonResponses.NotFound,
    CommonResponses.Unauthorized,
    CommonResponses.Forbidden,
  );

// Update Transaction Endpoint
export const UpdateTransactionApiOperation = () =>
  ApiOperation({
    summary: "Update a transaction",
    description:
      "Updates an existing transaction. Users can only update their own transactions.",
  });

export const UpdateTransactionApiBody = () =>
  ApiBody({
    type: UpdateTransactionDto,
    description: "Transaction fields to update",
    examples: {
      updateAmount: {
        summary: "Update amount and note",
        value: {
          amount: 99.99,
          note: "Updated amount after refund",
        },
      },
      updateCategory: {
        summary: "Update category and type",
        value: {
          type: "expense",
          category: "Entertainment",
        },
      },
    },
  });

export const UpdateTransactionApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Transaction updated successfully",
      schema: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: TransactionResponseSchema,
        },
      },
    }),
    CommonResponses.NotFound,
    CommonResponses.Unauthorized,
    CommonResponses.Forbidden,
    CommonResponses.BadRequest,
  );

// Delete Transaction Endpoint
export const DeleteTransactionApiOperation = () =>
  ApiOperation({
    summary: "Delete a transaction",
    description:
      "Deletes a transaction. Users can only delete their own transactions.",
  });

export const DeleteTransactionApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: "Transaction deleted successfully",
    }),
    CommonResponses.NotFound,
    CommonResponses.Unauthorized,
    CommonResponses.Forbidden,
  );

// Get Transaction Summary Endpoint
export const GetTransactionSummaryApiOperation = () =>
  ApiOperation({
    summary: "Get transaction summary",
    description:
      "Retrieves a summary of transactions (total income, expenses, balance) for the authenticated user.",
  });

export const GetTransactionSummaryApiQuery = () =>
  ApiQuery({
    name: "timeframe",
    required: false,
    enum: ["day", "week", "month", "year", "all"],
    description: "Timeframe for the summary (default: 'month')",
    example: "month",
  });

export const GetTransactionSummaryApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Transaction summary retrieved successfully",
      schema: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              totalIncome: { type: "number", example: 1500.75 },
              totalExpenses: { type: "number", example: 1250.25 },
              balance: { type: "number", example: 250.5 },
              currency: { type: "string", example: "USD" },
              timeframe: { type: "string", example: "month" },
              startDate: {
                type: "string",
                example: "2024-09-01T00:00:00.000Z",
              },
              endDate: { type: "string", example: "2024-09-30T23:59:59.999Z" },
              categories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string", example: "Food & Dining" },
                    amount: { type: "number", example: 450.75 },
                    percentage: { type: "number", example: 36.05 },
                  },
                },
              },
            },
          },
        },
      },
    }),
    CommonResponses.Unauthorized,
  );

// Export common schemas and responses for reuse
export { TransactionResponseSchema, CommonResponses };
