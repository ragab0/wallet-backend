import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User as PrismaUser } from "@prisma/client";
import { Request } from "express";

export const UserDec = createParamDecorator(
  (data: keyof PrismaUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (data) {
      return request.user?.[data]; // e.g. @User('email') → string | undefined
    }
    return request.user; // full Prisma.User
  },
);
