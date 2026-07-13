import { createCrudService } from "@/lib/createCrudService";

export const queryFormService = createCrudService("/admin/query-form");
export const subscriberService = createCrudService("/admin/subscriber");
