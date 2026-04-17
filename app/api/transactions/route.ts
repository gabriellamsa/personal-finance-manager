import { listTransactions, createTransaction } from "@/features/transactions/transactions.service";
import {
  transactionFilterSchema,
  transactionFormSchema,
} from "@/features/transactions/transactions.schemas";
import { requireApiUser } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

function getFilterValue(value: string | null) {
  return value ? value : undefined;
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const url = new URL(request.url);
    const filters = transactionFilterSchema.parse({
      categoryId: getFilterValue(url.searchParams.get("categoryId")),
      from: getFilterValue(url.searchParams.get("from")),
      page: getFilterValue(url.searchParams.get("page")),
      to: getFilterValue(url.searchParams.get("to")),
      type: getFilterValue(url.searchParams.get("type")),
    });

    const result = await listTransactions(user.id, filters);

    return jsonSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = transactionFormSchema.parse(await request.json());
    const transaction = await createTransaction(user.id, payload);

    return jsonSuccess(
      {
        transaction,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
