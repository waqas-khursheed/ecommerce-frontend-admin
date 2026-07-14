import { createCrudService } from "@/lib/createCrudService";
import type { Category } from "@/types/category";

// Create/update bodies are FormData (image + icon file uploads) rather than
// the plain CategoryFormValues shape — see app/(admin)/categories/page.tsx.
export const categoryService = createCrudService<Category, FormData, FormData>("/admin/category", {
  listKey: "categories",
});
