import { createCategorySchema } from "@/features/categories/categories.schemas";
import { createCategory, listAvailableCategories } from "@/features/categories/categories.service";
import { requireApiUser } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    const categories = await listAvailableCategories(user.id);

    return jsonSuccess({
      categories,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = createCategorySchema.parse(await request.json());
    const category = await createCategory(user.id, payload);

    return jsonSuccess(
      {
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
