"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import type { PaginationMeta } from "@/types/api";

interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

interface UsePaginatedListOptions {
  pageSize?: number;
  errorMessage?: string;
}

// Wraps the fetch-a-page/track-page-state/handle-error boilerplate that
// otherwise repeats on every admin list page — pass the resulting
// `pagination` object straight to <DataTable pagination={...} />.
export function usePaginatedList<T>(
  fetcher: (params: { page: number; limit: number }) => Promise<PaginatedResult<T>>,
  { pageSize = 20, errorMessage = "Failed to load data" }: UsePaginatedListOptions = {}
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher({ page, limit: pageSize });
      setItems(result.items);
      setMeta(result.meta);
    } catch (error) {
      toast.error(getApiErrorMessage(error, errorMessage));
    } finally {
      setIsLoading(false);
    }
    // fetcher is intentionally excluded from deps — it's expected to be a
    // fresh-but-equivalent closure each render (e.g. `(p) => service.list(p)`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // Refetching when `page` changes is exactly what this effect is
  // synchronizing (component state -> server request), so the state updates
  // inside `reload` are intentional, not the "derived state" anti-pattern
  // react-hooks/set-state-in-effect otherwise warns about.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return {
    items,
    setItems,
    meta,
    page,
    setPage,
    isLoading,
    reload,
    pagination: meta
      ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage }
      : undefined,
  };
}
