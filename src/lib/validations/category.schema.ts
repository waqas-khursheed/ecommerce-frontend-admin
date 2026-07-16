import { z } from "zod";
import { integer, requiredText, statusField } from "@/lib/validation";

// Mirrors backed/src/modules/categories/validations/category.validation.js
export const categorySchema = z.object({
  title: requiredText(2, 255, "Title"),
  status: statusField,
  order_by: integer("Display order").optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
