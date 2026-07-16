import { z } from "zod";
import { nonNegativeInt, nonNegativeNumber, optionalText, percentage, positiveNumber, requiredText, statusField } from "@/lib/validation";

// Mirrors backed/src/modules/products/validations/product.validation.js
export const productSchema = z.object({
  title: requiredText(2, 255, "Title"),
  price: positiveNumber("Price"),
  d_price: nonNegativeNumber("Discount price").optional(),
  d_percentage: percentage("Discount percentage").optional(),
  quantity: nonNegativeInt("Quantity"),
  sku: optionalText(255),
  status: statusField,
  meta_keywords: optionalText(255),
  meta_description: optionalText(255),
  brand_id: z.coerce.number().int().positive().nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
