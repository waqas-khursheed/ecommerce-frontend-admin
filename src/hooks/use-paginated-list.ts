"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { useDebounce } from "@/hooks/use-debounce";
import type { PaginationMeta } from "@/types/api";

interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

interface UsePaginatedListOptions {
  pageSize?: number;
  errorMessage?: string;
  /** Seeds the search box (e.g. from a `?search=` URL param) without waiting for the debounce. */
  initialSearch?: string;
}

// Wraps the fetch-a-page/track-page-state/handle-error boilerplate that
// otherwise repeats on every admin list page — pass the resulting
// `pagination` object straight to <DataTable pagination={...} />.
//
// Also owns search state: the fetcher receives `search` alongside
// `page`/`limit` so filtering happens server-side across the WHOLE list, not
// just whatever page happens to be loaded (DataTable's own search box only
// filters the current page's `data` client-side — fine for small lookup
// tables, wrong for anything paginated). Pass `searchValue`/`onSearchChange`
// through to <DataTable> to wire this up; omit them to keep the table's old
// client-side-only search for endpoints that don't accept `?search=`.
export function usePaginatedList<T>(
  fetcher: (params: { page: number; limit: number; search?: string }) => Promise<PaginatedResult<T>>,
  { pageSize = 20, errorMessage = "Failed to load data", initialSearch = "" }: UsePaginatedListOptions = {}
) {
  const [page, setPage] = useState(1);
  const [search, setSearchRaw] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 400);
  const [items, setItems] = useState<T[]>([]);

  // Resetting `page` immediately (not waiting for the debounce) means that
  // by the time `debouncedSearch` actually changes, `page` has already
  // settled at 1 — so the effect below fires exactly once per search, with
  // the correct (1, newSearch) pair, instead of once with the stale page
  // and again after the reset.
  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
  }, []);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher({ page, limit: pageSize, search: debouncedSearch || undefined });
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
  }, [page, pageSize, debouncedSearch]);

  // Refetching when `page`/`debouncedSearch` changes is exactly what this
  // effect is synchronizing (component state -> server request), so the
  // state updates inside `reload` are intentional, not the "derived state"
  // anti-pattern react-hooks/set-state-in-effect otherwise warns about.
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
    search,
    setSearch,
    isLoading,
    reload,
    pagination: meta
      ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage }
      : undefined,
  };
}
