import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  Admin,
  AdminLoginPayload,
  AdminLoginResult,
  UpdateAdminProfilePayload,
  ChangeAdminPasswordPayload,
} from "@/types/auth";

export const authService = {
  login: (payload: AdminLoginPayload) =>
    http
      .post<ApiSuccessResponse<AdminLoginResult>>("/admin/auth/login", payload)
      .then((res) => res.data.data),

  getProfile: () =>
    http.get<ApiSuccessResponse<Admin>>("/admin/auth/profile").then((res) => res.data.data),

  updateProfile: (payload: UpdateAdminProfilePayload) => {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.email !== undefined) formData.append("email", payload.email);
    if (payload.image) formData.append("image", payload.image);

    return http
      .put<ApiSuccessResponse<Admin>>("/admin/auth/profile", formData)
      .then((res) => res.data.data);
  },

  changePassword: (payload: ChangeAdminPasswordPayload) =>
    http.patch<ApiSuccessResponse<null>>("/admin/auth/change-password", payload).then((res) => res.data.data),
};
