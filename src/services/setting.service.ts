import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type { WebSetting } from "@/types/setting";

// Singleton settings row — GET returns 404 (NOT_CONFIGURED) before the first
// save, PUT upserts it. Not a list/CRUD resource, so no createCrudService.
export const webSettingService = {
  get: () =>
    http
      .get<ApiSuccessResponse<WebSetting>>("/admin/web-setting")
      .then((res) => res.data.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  update: (payload: FormData) =>
    http.put<ApiSuccessResponse<WebSetting>>("/admin/web-setting", payload).then((res) => res.data.data),
};
