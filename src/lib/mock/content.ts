export interface FaqCategoryRow {
  id: number;
  name: string;
  faqs: number;
  status: "Active" | "Inactive";
}

export const faqCategories: FaqCategoryRow[] = [
  { id: 1, name: "Orders & Shipping", faqs: 8, status: "Active" },
  { id: 2, name: "Returns & Refunds", faqs: 6, status: "Active" },
  { id: 3, name: "Payments", faqs: 5, status: "Active" },
  { id: 4, name: "Account", faqs: 4, status: "Inactive" },
];

export interface FaqRow {
  id: number;
  question: string;
  category: string;
  status: "Active" | "Inactive";
}

export const faqs: FaqRow[] = [
  { id: 1, question: "How long does delivery take?", category: "Orders & Shipping", status: "Active" },
  { id: 2, question: "Can I change my delivery address?", category: "Orders & Shipping", status: "Active" },
  { id: 3, question: "What is your return policy?", category: "Returns & Refunds", status: "Active" },
  { id: 4, question: "How do I track my refund?", category: "Returns & Refunds", status: "Active" },
  { id: 5, question: "Which payment methods are accepted?", category: "Payments", status: "Active" },
];

export interface CmsPageRow {
  id: number;
  title: string;
  slug: string;
  status: "Published" | "Draft";
  updated: string;
}

export const cmsPages: CmsPageRow[] = [
  { id: 1, title: "About Us", slug: "about-us", status: "Published", updated: "Feb 5, 2026" },
  { id: 2, title: "Privacy Policy", slug: "privacy-policy", status: "Published", updated: "Jan 20, 2026" },
  { id: 3, title: "Terms & Conditions", slug: "terms-conditions", status: "Published", updated: "Jan 20, 2026" },
  { id: 4, title: "Careers", slug: "careers", status: "Draft", updated: "Feb 1, 2026" },
];

export const contactUsPage = {
  title: "Contact Us",
  email: "support@ecommerce.test",
  phone: "+1 (555) 010-2020",
  address: "221B Market Street, San Francisco, CA",
  mapEmbedUrl: "",
};
