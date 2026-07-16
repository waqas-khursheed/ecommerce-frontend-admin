import { z } from "zod";
import { requiredText, statusField } from "@/lib/validation";

// Mirrors backed/src/modules/coupons/validations/coupon.validation.js
export const couponSchema = z.object({
  code: requiredText(3, 50, "Coupon code"),
  percentage: z.coerce
    .number({ message: "Discount must be a number" })
    .gt(0, "Discount must be greater than 0")
    .max(100, "Discount cannot exceed 100%"),
  status: statusField,
  usage_limit: z.coerce
    .number()
    .int("Usage limit must be a whole number")
    .positive("Usage limit must be greater than 0")
    .nullable()
    .optional(),
  min_order_amount: z.coerce
    .number()
    .positive("Minimum order amount must be greater than 0")
    .nullable()
    .optional(),
  expires_at: z
    .string()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid expiry date")
    .nullable()
    .optional(),
});

export type CouponInput = z.infer<typeof couponSchema>;
