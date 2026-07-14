import { http } from "./http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";

interface CrudServiceOptions {
  // The backend wraps each module's list differently — `{ categories: [...] }`,
  // `{ brands: [...] }`, `{ items: [...] }` (attribute items), etc. — instead
  // of a bare array. Pass the exact key for modules you've verified against
  // the backend; omitted, list() falls back to "the first array-valued
  // property in the response" (works for most simple modules, but verify
  // before relying on it for something new).
  listKey?: string;
}

export function createCrudService<TEntity, TCreatePayload = Partial<TEntity>, TUpdatePayload = TCreatePayload>(
  resourcePath: string,
  { listKey }: CrudServiceOptions = {}
) {
  return {
    list: (params?: ListQueryParams) =>
      http
        .get<ApiSuccessResponse<Record<string, unknown>>>(resourcePath, { params })
        .then((res) => {
          const data = res.data.data;
          const items = (listKey ? data[listKey] : Object.values(data).find(Array.isArray)) ?? [];
          return { items: items as TEntity[], meta: data.meta as PaginationMeta };
        }),

    getById: (id: number | string) =>
      http
        .get<ApiSuccessResponse<TEntity>>(`${resourcePath}/${id}`)
        .then((res) => res.data.data),

    create: (payload: TCreatePayload) =>
      http
        .post<ApiSuccessResponse<TEntity>>(`${resourcePath}/create`, payload)
        .then((res) => res.data.data),

    update: (id: number | string, payload: TUpdatePayload) =>
      http
        .put<ApiSuccessResponse<TEntity>>(`${resourcePath}/${id}`, payload)
        .then((res) => res.data.data),

    toggleStatus: (id: number | string) =>
      http
        .patch<ApiSuccessResponse<TEntity>>(`${resourcePath}/${id}/status`)
        .then((res) => res.data.data),

    remove: (id: number | string) =>
      http
        .delete<ApiSuccessResponse<null>>(`${resourcePath}/${id}`)
        .then((res) => res.data.data),
  };
}
