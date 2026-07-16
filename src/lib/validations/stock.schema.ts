import { z } from "zod";
import { nonNegativeNumber, percentage, requiredSelectId } from "@/lib/validation";

// Mirrors backed/src/modules/stocks/validations/stock.validation.js
export const stockSchema = z.object({
  product_id: requiredSelectId("Product"),
  stock_qty: z.coerce.number().int("Quantity must be a whole number").min(0, "Quantity cannot be negative").nullable().optional(),
  stock_dis_price: nonNegativeNumber("Discount price").optional(),
  stock_dis_percentage: percentage("Discount percentage").optional(),
  stock_price: nonNegativeNumber("Price override").nullable().optional(),
  weight: nonNegativeNumber("Weight").nullable().optional(),
  color_id: z.coerce.number().int().positive().nullable().optional(),
  size_id: z.coerce.number().int().positive().nullable().optional(),
  fitting_id: z.coerce.number().int().positive().nullable().optional(),
});

export type StockInput = z.infer<typeof stockSchema>;
