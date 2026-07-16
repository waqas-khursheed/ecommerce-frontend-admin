import { z } from "zod";
import { requiredText, statusField } from "@/lib/validation";

// Mirrors backed/src/modules/brands/validations/brand.validation.js
export const brandSchema = z.object({
  title: requiredText(2, 255, "Name"),
  status: statusField,
});

export type BrandInput = z.infer<typeof brandSchema>;
