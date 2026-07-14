import { createCrudService } from "@/lib/createCrudService";
import type { Attribute, AttributeFormValues, AttributeItem } from "@/types/attribute";

export const attributeService = createCrudService<Attribute, AttributeFormValues, AttributeFormValues>(
  "/admin/attribute",
  { listKey: "attributes" }
);

// Create/update bodies are FormData (optional `image` file upload).
export const attributeItemService = createCrudService<AttributeItem, FormData, FormData>(
  "/admin/attribute-item",
  { listKey: "items" }
);
