import { updateCategorySchema } from "@/features/categories/categories.schemas";
import {
  deleteCustomCategory,
  updateCustomCategory,
} from "@/features/categories/categories.service";
import { requireApiUser } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

type CategoryRouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: CategoryRouteContext,
) {
  try {
    const user = await requireApiUser();
    const payload = updateCategorySchema.parse(await request.json());
    const { categoryId } = await context.params;
    const category = await updateCustomCategory(user.id, categoryId, payload);

    return jsonSuccess({
      category,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: CategoryRouteContext,
) {
  try {
    const user = await requireApiUser();
    const { categoryId } = await context.params;
    const result = await deleteCustomCategory(user.id, categoryId);

    return jsonSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
