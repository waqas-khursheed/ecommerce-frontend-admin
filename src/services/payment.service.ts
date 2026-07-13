import { createCrudService } from "@/lib/createCrudService";

export const bankService = createCrudService("/admin/bank");
export const cardCategoryService = createCrudService("/admin/card-category");
export const cardTypeService = createCrudService("/admin/card-type");
export const cardDetailService = createCrudService("/admin/card-detail");
export const mobileCardService = createCrudService("/admin/mobile-card");
