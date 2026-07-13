import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type { AdminLoginPayload, AdminLoginResult } from "@/types/auth";

export const authService = {
  login: (payload: AdminLoginPayload) =>
    http
      .post<ApiSuccessResponse<AdminLoginResult>>("/admin/auth/login", payload)
      .then((res) => res.data.data),
};
