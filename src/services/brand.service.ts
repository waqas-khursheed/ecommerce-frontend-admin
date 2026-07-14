import { createCrudService } from "@/lib/createCrudService";
import type { Brand } from "@/types/brand";

// Create/update bodies are FormData (logo + banner file uploads).
export const brandService = createCrudService<Brand, FormData, FormData>("/admin/brand", {
  listKey: "brands",
});
