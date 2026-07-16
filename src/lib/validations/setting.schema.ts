import { z } from "zod";
import { nonNegativeInt, optionalText } from "@/lib/validation";

const optionalTime = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Use HH:MM format")
  .optional()
  .or(z.literal(""));

// Mirrors backed/src/modules/settings/validations/webSetting.validation.js
export const webSettingSchema = z.object({
  website_link: z.string().trim().url("Enter a full URL, e.g. https://example.com").optional().or(z.literal("")),
  website_name: optionalText(150),
  address: optionalText(255),
  email: z.string().trim().email("Invalid email format").max(95).optional().or(z.literal("")),
  phone_one: optionalText(25),
  phone_two: optionalText(25),
  copyright: optionalText(150),
  footer_widget_1: optionalText(25),
  footer_widget_2: optionalText(25),
  footer_widget_3: optionalText(25),
  footer_widget_4: optionalText(25),
  delivery_start_time: optionalTime,
  delivery_end_time: optionalTime,
  min_amount_for_free_delivery: nonNegativeInt("Minimum amount for free delivery").optional(),
  shipping_rate: nonNegativeInt("Shipping rate").optional(),
});

export type WebSettingInput = z.infer<typeof webSettingSchema>;
