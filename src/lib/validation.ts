import { z } from "zod";

export type FieldErrors = Record<string, string>;

export type ValidationResult<T> =
  | { data: T; errors: null }
  | { data: null; errors: FieldErrors };

// Runs a Zod schema against form/payload data and flattens issues into one
// message per field path, so pages can drop it straight into a React error
// map without touching Zod's ZodError shape directly.
export function validateForm<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) return { data: result.data, errors: null };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_root";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { data: null, errors };
}

// Shared field primitives — the backend (Joi) rules repeat the same shapes
// (a required title, a 0-100 percentage, a non-negative price) across nearly
// every resource, so these keep each schema file terse and consistent.
export const requiredText = (min: number, max: number, label = "This field") =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .or(z.literal(""));

export const percentage = (label = "Percentage") =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .min(0, `${label} must be at least 0`)
    .max(100, `${label} must be at most 100`);

export const nonNegativeNumber = (label = "This field") =>
  z.coerce.number({ message: `${label} must be a number` }).min(0, `${label} cannot be negative`);

export const positiveNumber = (label = "This field") =>
  z.coerce.number({ message: `${label} must be a number` }).positive(`${label} must be greater than 0`);

export const integer = (label = "This field") =>
  z.coerce.number({ message: `${label} must be a number` }).int(`${label} must be a whole number`);

export const nonNegativeInt = (label = "This field") =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(0, `${label} cannot be negative`);

export const requiredSelectId = (label = "This field") =>
  z.coerce
    .number({ message: `${label} is required` })
    .int()
    .positive(`${label} is required`);

export const statusField = z.coerce.number().refine((v) => v === 0 || v === 1, {
  message: "Status must be Active or Inactive",
});
