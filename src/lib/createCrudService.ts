import { http } from "./http";
import type { ApiSuccessResponse, ListQueryParams } from "@/types/api";

export function createCrudService<TEntity, TCreatePayload = Partial<TEntity>, TUpdatePayload = TCreatePayload>(
  resourcePath: string
) {
  return {
    list: (params?: ListQueryParams) =>
      http
        .get<ApiSuccessResponse<TEntity[]>>(resourcePath, { params })
        .then((res) => res.data.data),

    getById: (id: number | string) =>
      http
        .get<ApiSuccessResponse<TEntity>>(`${resourcePath}/${id}`)
        .then((res) => res.data.data),

    create: (payload: TCreatePayload) =>
      http
        .post<ApiSuccessResponse<TEntity>>(resourcePath, payload)
        .then((res) => res.data.data),

    update: (id: number | string, payload: TUpdatePayload) =>
      http
        .put<ApiSuccessResponse<TEntity>>(`${resourcePath}/${id}`, payload)
        .then((res) => res.data.data),

    remove: (id: number | string) =>
      http
        .delete<ApiSuccessResponse<null>>(`${resourcePath}/${id}`)
        .then((res) => res.data.data),
  };
}
