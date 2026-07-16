import { z } from "zod";

// Mirrors backed/src/modules/auth/validations/admin.auth.validation.js
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
