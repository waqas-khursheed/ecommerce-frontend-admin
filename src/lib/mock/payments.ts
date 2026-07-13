export interface BankRow {
  id: number;
  name: string;
  accountName: string;
  accountNumber: string;
  status: "Active" | "Inactive";
}

export const banks: BankRow[] = [
  { id: 1, name: "Chase Bank", accountName: "Ecommerce Co.", accountNumber: "****4821", status: "Active" },
  { id: 2, name: "HSBC", accountName: "Ecommerce Co.", accountNumber: "****9012", status: "Active" },
];

export interface CardTypeRow {
  id: number;
  name: string;
  category: string;
  status: "Active" | "Inactive";
}

export const cardCategories: CardTypeRow[] = [
  { id: 1, name: "Credit Card", category: "-", status: "Active" },
  { id: 2, name: "Debit Card", category: "-", status: "Active" },
];

export const cardTypes: CardTypeRow[] = [
  { id: 1, name: "Visa", category: "Credit Card", status: "Active" },
  { id: 2, name: "Mastercard", category: "Credit Card", status: "Active" },
  { id: 3, name: "Maestro", category: "Debit Card", status: "Active" },
];

export const cardDetails = [
  { id: 1, holder: "Jenny Wilson", type: "Visa", last4: "4242", expiry: "08/27", status: "Active" as const },
  { id: 2, holder: "Devon Lane", type: "Mastercard", last4: "5555", expiry: "11/26", status: "Active" as const },
];

export const mobileCards = [
  { id: 1, provider: "Apple Pay", identifier: "device-9f21", status: "Active" as const },
  { id: 2, provider: "Google Pay", identifier: "device-3c88", status: "Inactive" as const },
];
