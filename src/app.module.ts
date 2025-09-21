import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { EmailModule } from "./email/email.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { LoggerModule } from "nestjs-pino";

const { JWT_SECRET, JWT_ACCESS_EXPIRES_IN = "15m" } = process.env;

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_ACCESS_EXPIRES_IN },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty" } // pretty logs in dev
            : undefined,
      },
    }),

    DatabaseModule,
    AuthModule,
    UsersModule,
    EmailModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      // Apply JWT Auth Guard globally
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      // Apply Roles Guard globally (after JWT guard)
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    AppService,
  ],
})
export class AppModule {}
