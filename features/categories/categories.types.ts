import type { CategoryScope, TransactionType } from "@prisma/client";

export type CategoryListItem = {
  color: string;
  icon: string;
  id: string;
  name: string;
  scope: CategoryScope;
  slug: string;
  systemKey: string | null;
  totalAmountInCents: number;
  transactionCount: number;
  type: TransactionType;
};
