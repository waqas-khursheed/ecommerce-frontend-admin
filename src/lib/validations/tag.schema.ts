import { z } from "zod";
import { requiredText } from "@/lib/validation";

// Mirrors backed/src/modules/tags/validations/tag.validation.js
export const tagSchema = z.object({
  name: requiredText(2, 99, "Tag name"),
});

export type TagInput = z.infer<typeof tagSchema>;
