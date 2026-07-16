import { z } from "zod";
import { integer, percentage, requiredSelectId, requiredText } from "@/lib/validation";

// Mirrors backed/src/modules/payments/routes/admin.bank.routes.js
export const bankSchema = z.object({
  bank_title: requiredText(2, 150, "Name"),
});

// Mirrors backed/src/modules/payments/routes/admin.cardCategory.routes.js
export const cardCategorySchema = z.object({
  card_category: requiredText(2, 150, "Name"),
});

// Mirrors backed/src/modules/payments/routes/admin.cardType.routes.js
export const cardTypeSchema = z.object({
  card_type: requiredText(2, 150, "Name"),
});

// Mirrors backed/src/modules/payments/routes/admin.cardDetail.routes.js
export const cardDetailSchema = z.object({
  card_no: integer("Card number (BIN)"),
  country_id: requiredSelectId("Country"),
  card_category_id: requiredSelectId("Card category"),
  card_type_id: requiredSelectId("Card type"),
  bank_id: requiredSelectId("Bank"),
  percentage: percentage("Discount"),
});

export type BankInput = z.infer<typeof bankSchema>;
export type CardCategoryInput = z.infer<typeof cardCategorySchema>;
export type CardTypeInput = z.infer<typeof cardTypeSchema>;
export type CardDetailInput = z.infer<typeof cardDetailSchema>;
