import { createCrudService } from "@/lib/createCrudService";

export const faqCategoryService = createCrudService("/admin/faq-category");
export const faqService = createCrudService("/admin/faq");
export const commonPageService = createCrudService("/admin/page");
export const contactUsPageService = createCrudService("/admin/contact-us-page");
