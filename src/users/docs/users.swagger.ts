import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { applyDecorators, HttpStatus } from "@nestjs/common";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto, UpdateUserPasswordDto } from "../dtos/update-user.dto";
import { UserResponseDto } from "../dtos/user-response.dto";

// User Response Schema
const UserResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
    email: { type: "string", example: "user@example.com" },
    fname: { type: "string", example: "John" },
    lname: { type: "string", example: "Doe" },
    picture: {
      type: "string",
      nullable: true,
      example: "https://example.com/avatar.jpg",
    },
    role: { type: "string", example: "USER", enum: ["USER", "ADMIN"] },
    isActive: { type: "boolean", example: true },
    isEmailVerified: { type: "boolean", example: true },
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
  NotFound: ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "User not found" },
        error: { type: "string", example: "Not Found" },
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
        message: {
          type: "string",
          examples: [
            "Validation failed",
            "New password and confirm password do not match",
            "Current password is incorrect",
          ],
        },
        error: { type: "string", example: "Bad Request" },
      },
    },
  }),
};

// Users Controller Documentation
export const UsersApiTags = () =>
  applyDecorators(
    ApiTags("Users"),
    ApiBearerAuth(),
    CommonResponses.Unauthorized,
  );

// Create User Endpoint
export const CreateUserApiOperation = () =>
  ApiOperation({
    summary: "Create a new user",
    description: "Creates a new user account. Requires authentication.",
  });

export const CreateUserApiBody = () =>
  ApiBody({
    type: CreateUserDto,
    description: "User details",
    examples: {
      newUser: {
        summary: "Create new user",
        value: {
          fname: "John",
          lname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
          picture: "https://example.com/avatar.jpg",
        },
      },
    },
  });

export const CreateUserApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "User created successfully",
      schema: UserResponseSchema,
    }),
    CommonResponses.BadRequest,
  );

// Get All Users Endpoint
export const GetAllUsersApiOperation = () =>
  ApiOperation({
    summary: "Get all users",
    description: "Retrieves all active users. Requires authentication.",
  });

export const GetAllUsersApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "List of active users",
      schema: {
        type: "array",
        items: UserResponseSchema,
      },
    }),
  );

// Get Current User (Me) Endpoints
export const GetMeApiOperation = () =>
  ApiOperation({
    summary: "Get current user profile",
    description: "Retrieves the authenticated user's profile information.",
  });

export const GetMeApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Current user profile",
      schema: UserResponseSchema,
    }),
  );

export const UpdateMeApiOperation = () =>
  ApiOperation({
    summary: "Update current user profile",
    description:
      "Updates the authenticated user's profile. Email and password cannot be changed here.",
  });

export const UpdateMeApiBody = () =>
  ApiBody({
    type: UpdateUserDto,
    description: "Update user details",
    examples: {
      updateProfile: {
        summary: "Update profile",
        value: {
          fname: "Jane",
          lname: "Smith",
          picture: "https://example.com/new-avatar.jpg",
          role: "USER",
        },
      },
    },
  });

export const UpdateMeApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Profile updated successfully",
      schema: UserResponseSchema,
    }),
    CommonResponses.BadRequest,
  );

export const DeleteMeApiOperation = () =>
  ApiOperation({
    summary: "Deactivate current user account",
    description:
      "Soft deletes the authenticated user's account by setting isActive to false.",
  });

export const DeleteMeApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: "Account deactivated successfully",
    }),
  );

export const ChangeMyPasswordApiOperation = () =>
  ApiOperation({
    summary: "Change current user password",
    description:
      "Changes the authenticated user's password. Requires current password verification.",
  });

export const ChangeMyPasswordApiBody = () =>
  ApiBody({
    type: UpdateUserPasswordDto,
    description: "Password change details",
    examples: {
      changePassword: {
        summary: "Change password",
        value: {
          currentPassword: "OldPass123!",
          newPassword: "NewSecurePass456!",
          confirmPassword: "NewSecurePass456!",
        },
      },
    },
  });

export const ChangeMyPasswordApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Password changed successfully",
      schema: UserResponseSchema,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Password validation errors",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: {
            type: "string",
            examples: [
              "New password and confirm password do not match",
              "Current password is incorrect",
            ],
          },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
  );

// User by ID Endpoints
export const GetUserByIdApiOperation = () =>
  ApiOperation({
    summary: "Get user by ID",
    description:
      "Retrieves a specific user by their ID. Requires authentication.",
  });

export const UserIdParam = () =>
  ApiParam({
    name: "id",
    description: "User ID (UUID)",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: "string",
  });

export const GetUserByIdApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "User details",
      schema: UserResponseSchema,
    }),
    CommonResponses.NotFound,
  );

export const UpdateUserApiOperation = () =>
  ApiOperation({
    summary: "Update user by ID",
    description:
      "Updates a specific user's profile. Email and password cannot be changed here. Requires authentication.",
  });

export const UpdateUserApiBody = () =>
  ApiBody({
    type: UpdateUserDto,
    description: "Update user details",
    examples: {
      updateUser: {
        summary: "Update user",
        value: {
          fname: "Updated",
          lname: "Name",
          picture: "https://example.com/updated-avatar.jpg",
        },
      },
    },
  });

export const UpdateUserApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "User updated successfully",
      schema: UserResponseSchema,
    }),
    CommonResponses.NotFound,
    CommonResponses.BadRequest,
  );

export const DeleteUserApiOperation = () =>
  ApiOperation({
    summary: "Deactivate user account",
    description:
      "Soft deletes a user account by setting isActive to false. Requires authentication.",
  });

export const DeleteUserApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: "User deactivated successfully",
    }),
    CommonResponses.NotFound,
  );

export const ChangeUserPasswordApiOperation = () =>
  ApiOperation({
    summary: "Change user password by ID",
    description:
      "Changes a specific user's password. Requires current password verification. Requires authentication.",
  });

export const ChangeUserPasswordApiBody = () =>
  ApiBody({
    type: UpdateUserPasswordDto,
    description: "Password change details",
    examples: {
      changePassword: {
        summary: "Change user password",
        value: {
          currentPassword: "CurrentPass123!",
          newPassword: "NewSecurePass456!",
          confirmPassword: "NewSecurePass456!",
        },
      },
    },
  });

export const ChangeUserPasswordApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Password changed successfully",
      schema: UserResponseSchema,
    }),
    CommonResponses.NotFound,
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Password validation errors",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: {
            type: "string",
            examples: [
              "New password and confirm password do not match",
              "Current password is incorrect",
            ],
          },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
  );

// Export common schemas for reuse
export { UserResponseSchema, CommonResponses };
