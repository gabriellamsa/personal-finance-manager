import { updateCategorySchema } from "@/features/categories/categories.schemas";
import {
  deleteCustomCategory,
  updateCustomCategory,
} from "@/features/categories/categories.service";
import { requireApiUser } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

type CategoryRouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

async function PATCHHandler(
  request: Request,
  context: CategoryRouteContext,
) {
  const user = await requireApiUser();
  const payload = updateCategorySchema.parse(await request.json());
  const { categoryId } = await context.params;
  const category = await updateCustomCategory(user.id, categoryId, payload);

  return jsonSuccess({
    category,
  });
}

async function DELETEHandler(
  _request: Request,
  context: CategoryRouteContext,
) {
  const user = await requireApiUser();
  const { categoryId } = await context.params;
  const result = await deleteCustomCategory(user.id, categoryId);

  return jsonSuccess(result);
}

export const PATCH = withRouteObservability(
  "/api/categories/[categoryId]",
  PATCHHandler,
);
export const DELETE = withRouteObservability(
  "/api/categories/[categoryId]",
  DELETEHandler,
);
