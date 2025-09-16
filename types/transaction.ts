import { Transaction } from "@prisma/client";

export interface TrunsactionResponse {
  status: "success";
  message: string;
  data: Transaction;
}
