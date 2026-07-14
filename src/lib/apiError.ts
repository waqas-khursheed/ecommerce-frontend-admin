import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

// Joi validation failures come back as { message: "Validation Error", errors: string[] }
// — the individual field messages are far more useful to show the admin than
// the generic top-level "Validation Error" string.
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const axiosError = err as AxiosError<ApiErrorResponse>;
  const data = axiosError.response?.data;
  if (!data) return fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(", ");
  }

  return data.message || fallback;
}
