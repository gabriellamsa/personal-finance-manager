import type { TransactionType } from "@prisma/client";

export type TransactionListItem = {
  amountInCents: number;
  category: {
    color: string;
    id: string;
    name: string;
    type: TransactionType;
  };
  createdAt: string;
  description: string;
  id: string;
  notes: string | null;
  occurredOn: string;
  type: TransactionType;
};

export type TransactionListResult = {
  page: number;
  pageCount: number;
  pageSize: number;
  summary: {
    balanceInCents: number;
    totalExpensesInCents: number;
    totalIncomeInCents: number;
    transactionCount: number;
  };
  transactions: TransactionListItem[];
};
