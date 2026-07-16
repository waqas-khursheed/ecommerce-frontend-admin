import { z } from "zod";
import { requiredSelectId, requiredText, statusField } from "@/lib/validation";

// Mirrors backed/src/modules/cms/routes/admin.faqCategory.routes.js
export const faqCategorySchema = z.object({
  title: requiredText(2, 150, "Title"),
});

// Mirrors backed/src/modules/cms/validations/faq.validation.js
export const faqSchema = z.object({
  question: requiredText(5, 255, "Question"),
  answer: requiredText(2, 100000, "Answer"),
  category_id: requiredSelectId("Category"),
});

// Mirrors backed/src/modules/cms/validations/commonPage.validation.js
export const commonPageSchema = z.object({
  title: requiredText(2, 150, "Title"),
  heading: requiredText(0, 150, "Heading").optional().or(z.literal("")),
  content: requiredText(1, 1000000, "Content"),
  page_name: requiredText(2, 100, "Page name"),
  status: statusField,
});

// Mirrors backed/src/modules/cms/routes/admin.contactUsPage.routes.js
export const contactUsPageSchema = z.object({
  title: requiredText(2, 150, "Title"),
  content: requiredText(1, 1000000, "Content"),
});

export type FaqCategoryInput = z.infer<typeof faqCategorySchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type CommonPageInput = z.infer<typeof commonPageSchema>;
export type ContactUsPageInput = z.infer<typeof contactUsPageSchema>;
