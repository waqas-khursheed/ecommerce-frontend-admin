import { createCrudService } from "@/lib/createCrudService";
import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type { CommonPage, ContactUsPage, Faq, FaqCategory, FaqPayload } from "@/types/cms";

export const faqCategoryService = createCrudService<FaqCategory>("/admin/faq-category", {
  listKey: "faqCategories",
});
export const faqService = createCrudService<Faq, FaqPayload>("/admin/faq", { listKey: "faqs" });
export const commonPageService = createCrudService<CommonPage, FormData, FormData>("/admin/page", {
  listKey: "pages",
});

// contact-us-page is a singleton (no list/create/delete) — GET fetches the
// single row (may not exist yet), PUT upserts it.
export const contactUsPageService = {
  get: () =>
    http
      .get<ApiSuccessResponse<ContactUsPage>>("/admin/contact-us-page")
      .then((res) => res.data.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  update: (payload: Partial<Pick<ContactUsPage, "title" | "content" | "map" | "status">>) =>
    http.put<ApiSuccessResponse<ContactUsPage>>("/admin/contact-us-page", payload).then((res) => res.data.data),
};
