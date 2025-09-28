import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { CloudinaryService } from "./services/cloudinary.service";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  controllers: [UsersController],
  providers: [UsersService, CloudinaryService],
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
})
export class UsersModule {}
