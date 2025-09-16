import { MailerOptions } from "@nestjs-modules/mailer";

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env;

export const mailerConfig: MailerOptions = {
  transport: {
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT || "587"),
    secure: false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  },
  defaults: {
    from: `"No Reply" <${MAIL_FROM}>`,
  },
};
