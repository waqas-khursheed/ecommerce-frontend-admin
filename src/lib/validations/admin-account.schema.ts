import { z } from "zod";
import { requiredText } from "@/lib/validation";

// Mirrors backed/src/modules/auth/validations/admin.management.validation.js
export const createAdminSchema = z.object({
  name: requiredText(2, 150, "Name"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
