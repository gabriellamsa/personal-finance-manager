import { transactionImportSchema } from "@/features/integrations/transaction-import.schemas";
import { importTransaction } from "@/features/integrations/transaction-import.service";
import { requireApiUser } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

async function POSTHandler(request: Request) {
  const user = await requireApiUser();
  const payload = transactionImportSchema.parse(await request.json());
  const result = await importTransaction(user.id, payload);

  return jsonSuccess(
    {
      import: {
        sourceRecordId: result.sourceRecordId,
        sourceSystem: result.sourceSystem,
        status: result.status,
      },
      transaction: {
        id: result.transactionId,
      },
    },
    { status: result.status === "created" ? 201 : 200 },
  );
}

export const POST = withRouteObservability(
  "/api/integrations/transactions/import",
  POSTHandler,
);
