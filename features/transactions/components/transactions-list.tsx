"use client";

import { useState } from "react";

import { DeleteTransactionButton } from "@/features/transactions/components/delete-transaction-button";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryListItem } from "@/features/categories/categories.types";
import type { TransactionListItem } from "@/features/transactions/transactions.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

type TransactionsListProps = {
  categories: CategoryListItem[];
  currencyCode: string;
  transactions: TransactionListItem[];
};

export function TransactionsList({
  categories,
  currencyCode,
  transactions,
}: TransactionsListProps) {
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(
    null,
  );

  if (!transactions.length) {
    return (
      <Card className="bg-card-strong">
        <CardContent className="text-sm text-foreground/64">
          No transactions match the current filters yet. Create your first entry
          above to start building the dashboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isEditing = editingTransactionId === transaction.id;

        return (
          <Card key={transaction.id} className="bg-card-strong">
            <CardContent className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        transaction.type === "INCOME" ? "success" : "danger"
                      }
                    >
                      {transaction.type === "INCOME" ? "Income" : "Expense"}
                    </Badge>
                    <Badge variant="neutral">{transaction.category.name}</Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {transaction.description}
                    </h3>
                    <p className="text-sm text-foreground/62">
                      {formatDate(transaction.occurredOn)}
                    </p>
                  </div>
                  {transaction.notes ? (
                    <p className="max-w-2xl text-sm text-foreground/68">
                      {transaction.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <p
                    className={
                      transaction.type === "INCOME"
                        ? "text-xl font-semibold text-accent"
                        : "text-xl font-semibold text-danger"
                    }
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(transaction.amountInCents, currencyCode)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setEditingTransactionId((current) =>
                          current === transaction.id ? null : transaction.id,
                        )
                      }
                    >
                      {isEditing ? "Close editor" : "Edit"}
                    </Button>
                    <DeleteTransactionButton transactionId={transaction.id} />
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="rounded-[24px] border border-border bg-white/70 p-5">
                  <TransactionForm
                    categories={categories}
                    mode="edit"
                    transaction={transaction}
                    onCancel={() => setEditingTransactionId(null)}
                    onCompleted={() => setEditingTransactionId(null)}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
