import {
  deleteTransaction,
  updateTransaction,
} from "@/features/transactions/transactions.service";
import { transactionFormSchema } from "@/features/transactions/transactions.schemas";
import { requireApiUser } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteProps) {
  try {
    const user = await requireApiUser();
    const { transactionId } = await context.params;
    const payload = transactionFormSchema.parse(await request.json());
    const transaction = await updateTransaction(user.id, transactionId, payload);

    return jsonSuccess({
      transaction,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteProps) {
  try {
    const user = await requireApiUser();
    const { transactionId } = await context.params;
    const result = await deleteTransaction(user.id, transactionId);

    return jsonSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
