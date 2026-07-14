import { http } from "@/lib/http";
import { createCrudService } from "@/lib/createCrudService";
import type { ApiSuccessResponse } from "@/types/api";
import type { Product } from "@/types/product";

// Create/update bodies are FormData (featured_image/hovered_image/gallery
// file uploads + category_ids as a comma-separated string — see
// app/(admin)/products/page.tsx).
export const productService = {
  ...createCrudService<Product, FormData, FormData>("/admin/product", { listKey: "products" }),

  // New gallery images are added via update()'s multipart "gallery" field;
  // removing one is a dedicated endpoint (there's no "replace gallery" concept).
  removeGalleryImage: (galleryId: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/product/gallery/${galleryId}`).then((res) => res.data.data),
};
