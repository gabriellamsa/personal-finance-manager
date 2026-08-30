import {
  deleteTransaction,
  updateTransaction,
} from "@/features/transactions/transactions.service";
import { transactionFormSchema } from "@/features/transactions/transactions.schemas";
import { requireApiUser } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

async function PATCHHandler(request: Request, context: RouteProps) {
  const user = await requireApiUser();
  const { transactionId } = await context.params;
  const payload = transactionFormSchema.parse(await request.json());
  const transaction = await updateTransaction(user.id, transactionId, payload);

  return jsonSuccess({
    transaction,
  });
}

async function DELETEHandler(_request: Request, context: RouteProps) {
  const user = await requireApiUser();
  const { transactionId } = await context.params;
  const result = await deleteTransaction(user.id, transactionId);

  return jsonSuccess(result);
}

export const PATCH = withRouteObservability(
  "/api/transactions/[transactionId]",
  PATCHHandler,
);
export const DELETE = withRouteObservability(
  "/api/transactions/[transactionId]",
  DELETEHandler,
);
