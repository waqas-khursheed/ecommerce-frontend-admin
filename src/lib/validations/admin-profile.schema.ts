import { z } from "zod";
import { requiredText } from "@/lib/validation";

// Mirrors backed/src/modules/auth/validations/admin.profile.validation.js
export const adminProfileSchema = z.object({
  name: requiredText(2, 150, "Name"),
  email: z.string().trim().email("Invalid email format"),
});

export type AdminProfileInput = z.infer<typeof adminProfileSchema>;

export const adminChangePasswordSchema = z
  .object({
    old_password: requiredText(1, 200, "Current password"),
    new_password: z.string().min(6, "New password must be at least 6 characters").max(200),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;
