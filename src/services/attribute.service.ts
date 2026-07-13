import { createCrudService } from "@/lib/createCrudService";

export const attributeService = createCrudService("/admin/attribute");
export const attributeItemService = createCrudService("/admin/attribute-item");
