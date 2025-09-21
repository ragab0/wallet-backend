import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
} from "@nestjs/swagger";
import { applyDecorators, HttpStatus } from "@nestjs/common";
import { SignupDto } from "../dtos/signup.dto";
import { LoginDto } from "../dtos/login.dto";
import {
  SendVerificationDto,
  VerifyEmailDto,
} from "../../email/dtos/email-verification.dto";

// Common Response Schemas
const AuthTokenResponseSchema = {
  type: "object",
  properties: {
    status: { type: "string", example: "success" },
    accessToken: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    refreshToken: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    data: {
      type: "object",
      properties: {
        id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
        email: { type: "string", example: "user@example.com" },
        fname: { type: "string", example: "John" },
        lname: { type: "string", example: "Doe" },
        picture: { type: "string", nullable: true },
        role: { type: "string", example: "USER", enum: ["USER", "ADMIN"] },
        isActive: { type: "boolean", example: true },
        isEmailVerified: { type: "boolean", example: true },
        createdAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        updatedAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
      },
    },
  },
};

// Common responses
const CommonResponses = {
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
  Unauthorized: ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized - Invalid credentials or token",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Invalid credentials" },
        error: { type: "string", example: "Unauthorized" },
      },
    },
  }),
  Forbidden: ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden - Insufficient permissions",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 403 },
        message: { type: "string", example: "Insufficient permissions" },
        error: { type: "string", example: "Forbidden" },
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
        message: { type: "string", example: "Resource not found" },
        error: { type: "string", example: "Not Found" },
      },
    },
  }),
  InternalServerError: ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal Server Error - Something went wrong",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        message: { type: "string", example: "Internal server error" },
        error: { type: "string", example: "Internal Server Error" },
      },
    },
  }),
};

// Auth Controller Documentation
export const AuthApiTags = () =>
  applyDecorators(
    ApiTags("Authentication"),
    CommonResponses.InternalServerError,
  );

// Signup Endpoint
export const SignupApiOperation = () =>
  ApiOperation({
    summary: "Register a new user",
    description:
      "Creates a new user account with email/password. After successful registration, user must verify their email before logging in. A welcome email is sent automatically.",
  });

export const SignupApiBody = () =>
  ApiBody({
    type: SignupDto,
    description: "User registration details",
    examples: {
      validUser: {
        summary: "Valid user registration",
        value: {
          email: "user@example.com",
          password: "SecurePass123!",
          passwordConfirm: "SecurePass123!",
          fname: "John",
          lname: "Doe",
        },
      },
    },
  });

export const SignupApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.TEMPORARY_REDIRECT,
      description: "Registration successful - Email verification required",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Please confirm your email to complete your registration",
          },
          redirectTo: { type: "string", example: "/send-verification" },
          payload: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Validation errors or password mismatch",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: {
            type: "string",
            examples: ["Passwords do not match", "Validation failed"],
          },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: "User already exists",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 409 },
          message: {
            type: "string",
            example: "User with this email already exists",
          },
          error: { type: "string", example: "Conflict" },
        },
      },
    }),
  );

// Login Endpoint
export const LoginApiOperation = () =>
  ApiOperation({
    summary: "User login",
    description:
      "Authenticates a user with email/password and returns JWT tokens. User must have verified email and active account.",
  });

export const LoginApiBody = () =>
  ApiBody({
    type: LoginDto,
    description: "User login credentials",
    examples: {
      validCredentials: {
        summary: "Valid credentials",
        value: {
          email: "user@example.com",
          password: "SecurePass123!",
        },
      },
    },
  });

export const LoginApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Successfully logged in",
      schema: AuthTokenResponseSchema,
    }),
    ApiResponse({
      status: HttpStatus.TEMPORARY_REDIRECT,
      description: "Email not verified",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Please verify your email before logging in",
          },
          redirectTo: { type: "string", example: "/send-verification" },
          payload: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Invalid credentials",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: { type: "string", example: "Incorrect email or password" },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: "Account deactivated",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 401 },
          message: {
            type: "string",
            example: "Your account has been deactivated",
          },
          error: { type: "string", example: "Unauthorized" },
        },
      },
    }),
  );

// Refresh Token Endpoint
export const RefreshTokenApiOperation = () =>
  ApiOperation({
    summary: "Refresh access token",
    description:
      "Generates new access and refresh tokens using a valid refresh token. Token must be provided in Authorization header.",
  });

export const RefreshTokenApiHeader = () =>
  ApiHeader({
    name: "Authorization",
    description: "Bearer {refresh_token}",
    required: true,
    schema: {
      type: "string",
      example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  });

export const RefreshTokenApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "New tokens generated successfully",
      schema: AuthTokenResponseSchema,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: "Invalid or expired refresh token",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 401 },
          message: { type: "string", example: "Invalid refresh token" },
          error: { type: "string", example: "Unauthorized" },
        },
      },
    }),
  );

// Email Verification Endpoints
export const SendVerificationApiOperation = () =>
  ApiOperation({
    summary: "Send verification email",
    description:
      "Sends a 6-digit verification code to user's email. Code expires in 15 minutes. Cannot send if email is already verified.",
  });

export const SendVerificationApiBody = () =>
  ApiBody({
    type: SendVerificationDto,
    description: "Email to send verification to",
    examples: {
      validEmail: {
        summary: "Valid email",
        value: {
          email: "user@example.com",
        },
      },
    },
  });

export const SendVerificationApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Verification email sent successfully",
      schema: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: {
            type: "string",
            example: "Verification email sent successfully",
          },
          data: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
              expiresIn: {
                type: "string",
                example: "2024-01-01T12:15:00.000Z",
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Various error conditions",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: {
            type: "string",
            examples: [
              "User with this email does not exist",
              "Email is already verified",
              "Failed to send verification email",
            ],
          },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
  );

export const VerifyEmailApiOperation = () =>
  ApiOperation({
    summary: "Verify email with code",
    description:
      "Verifies user's email using 6-digit code. Returns JWT tokens on successful verification (auto-login).",
  });

export const VerifyEmailApiBody = () =>
  ApiBody({
    type: VerifyEmailDto,
    description: "Email and verification code",
    examples: {
      validVerification: {
        summary: "Valid verification",
        value: {
          email: "user@example.com",
          code: "123456",
        },
      },
    },
  });

export const VerifyEmailApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: "Email verified successfully - User logged in",
      schema: AuthTokenResponseSchema,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Verification errors",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: {
            type: "string",
            examples: [
              "User not found",
              "No verification code found",
              "Verification code has expired",
              "Invalid verification code",
            ],
          },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
  );

// Google OAuth Endpoints
export const GoogleAuthApiOperation = () =>
  ApiOperation({
    summary: "Initiate Google OAuth",
    description:
      "Redirects to Google OAuth consent screen. On success, user is redirected to callback URL with tokens.",
  });

export const GoogleAuthCallbackApiOperation = () =>
  ApiOperation({
    summary: "Google OAuth callback",
    description:
      "Handles Google OAuth callback. Creates new user or links to existing. Redirects to frontend with tokens or error.",
  });

export const GoogleAuthCallbackApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: HttpStatus.FOUND,
      description: "Redirect to frontend with tokens or error",
      headers: {
        Location: {
          description: "Redirect URL",
          schema: {
            type: "string",
            examples: [
              "{FRONTEND_URL}/auth/callback?access_token={token}&refresh_token={token}&status=success",
              "{FRONTEND_URL}/auth/callback?status=error&message=Authentication failed",
            ],
          },
        },
      },
    }),
  );

// Export common responses for reuse
export { CommonResponses, AuthTokenResponseSchema };
