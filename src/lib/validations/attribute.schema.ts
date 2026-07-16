import { z } from "zod";
import { integer, requiredSelectId, requiredText } from "@/lib/validation";

// Mirrors backed/src/modules/attributes/validations/attribute.validation.js
export const attributeSchema = z.object({
  attribute_title: requiredText(2, 255, "Attribute title"),
});

export const attributeItemSchema = z.object({
  title: requiredText(1, 255, "Value"),
  attribute_id: requiredSelectId("Attribute"),
  order_by: integer("Display order").optional(),
});

export type AttributeInput = z.infer<typeof attributeSchema>;
export type AttributeItemInput = z.infer<typeof attributeItemSchema>;
