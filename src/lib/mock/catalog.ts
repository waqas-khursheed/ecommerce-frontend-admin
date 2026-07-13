export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  parent: string | null;
  products: number;
  status: "Active" | "Inactive";
}

export const categories: CategoryRow[] = [
  { id: 1, name: "Man Clothes", slug: "man-clothes", parent: null, products: 128, status: "Active" },
  { id: 2, name: "Women Clothes", slug: "women-clothes", parent: null, products: 156, status: "Active" },
  { id: 3, name: "Kid Clothes", slug: "kid-clothes", parent: null, products: 74, status: "Active" },
  { id: 4, name: "Shirts", slug: "shirts", parent: "Man Clothes", products: 42, status: "Active" },
  { id: 5, name: "Jackets", slug: "jackets", parent: "Women Clothes", products: 31, status: "Active" },
  { id: 6, name: "Footwear", slug: "footwear", parent: null, products: 58, status: "Inactive" },
  { id: 7, name: "Accessories", slug: "accessories", parent: null, products: 89, status: "Active" },
];

export interface BrandRow {
  id: number;
  name: string;
  products: number;
  status: "Active" | "Inactive";
}

export const brands: BrandRow[] = [
  { id: 1, name: "Northline", products: 64, status: "Active" },
  { id: 2, name: "Urban Craft", products: 48, status: "Active" },
  { id: 3, name: "Solstice", products: 37, status: "Active" },
  { id: 4, name: "Fieldwear", products: 22, status: "Inactive" },
  { id: 5, name: "Everstitch", products: 55, status: "Active" },
];

export interface AttributeRow {
  id: number;
  name: string;
  type: "Color" | "Size" | "Material";
  items: number;
  status: "Active" | "Inactive";
}

export const attributes: AttributeRow[] = [
  { id: 1, name: "Color", type: "Color", items: 8, status: "Active" },
  { id: 2, name: "Size", type: "Size", items: 6, status: "Active" },
  { id: 3, name: "Material", type: "Material", items: 5, status: "Active" },
];

export const attributeItems = [
  { id: 1, attribute: "Color", value: "Purple", swatch: "#7c3aed" },
  { id: 2, attribute: "Color", value: "Emerald", swatch: "#10b981" },
  { id: 3, attribute: "Color", value: "Amber", swatch: "#f59e0b" },
  { id: 4, attribute: "Size", value: "S", swatch: null },
  { id: 5, attribute: "Size", value: "M", swatch: null },
  { id: 6, attribute: "Size", value: "L", swatch: null },
];

export interface ProductRow {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: "Active" | "Draft" | "Out_of_stock";
  rating: number;
}

export const products: ProductRow[] = [
  { id: 1, name: "Overshirt with pockets", sku: "OVR-001", category: "Man Clothes", brand: "Northline", price: 220, stock: 42, status: "Active", rating: 4.5 },
  { id: 2, name: "Classic Shirt", sku: "SHT-014", category: "Man Clothes", brand: "Urban Craft", price: 76.89, stock: 128, status: "Active", rating: 4.2 },
  { id: 3, name: "Cropped T-Shirt", sku: "TSH-022", category: "Women Clothes", brand: "Solstice", price: 79.8, stock: 89, status: "Active", rating: 4.6 },
  { id: 4, name: "Kids Cargo Pant", sku: "PNT-005", category: "Kid Clothes", brand: "Fieldwear", price: 86.65, stock: 0, status: "Out_of_stock", rating: 4.0 },
  { id: 5, name: "Wool Sweater", sku: "SWT-019", category: "Man Clothes", brand: "Everstitch", price: 56.07, stock: 69, status: "Active", rating: 4.4 },
  { id: 6, name: "Light Jacket", sku: "JKT-031", category: "Women Clothes", brand: "Northline", price: 36.0, stock: 65, status: "Draft", rating: 3.9 },
  { id: 7, name: "Half Shirt", sku: "SHT-041", category: "Man Clothes", brand: "Urban Craft", price: 46.78, stock: 58, status: "Active", rating: 4.1 },
  { id: 8, name: "Denim Jacket", sku: "JKT-052", category: "Women Clothes", brand: "Solstice", price: 128.0, stock: 24, status: "Active", rating: 4.7 },
];

export interface StockRow {
  id: number;
  product: string;
  sku: string;
  warehouse: string;
  quantity: number;
  reserved: number;
  status: "In_stock" | "Low" | "Out_of_stock";
}

export const stock: StockRow[] = [
  { id: 1, product: "Overshirt with pockets", sku: "OVR-001", warehouse: "Main Warehouse", quantity: 42, reserved: 6, status: "In_stock" },
  { id: 2, product: "Classic Shirt", sku: "SHT-014", warehouse: "Main Warehouse", quantity: 128, reserved: 12, status: "In_stock" },
  { id: 3, product: "Kids Cargo Pant", sku: "PNT-005", warehouse: "East Hub", quantity: 0, reserved: 0, status: "Out_of_stock" },
  { id: 4, product: "Wool Sweater", sku: "SWT-019", warehouse: "Main Warehouse", quantity: 4, reserved: 2, status: "Low" },
  { id: 5, product: "Light Jacket", sku: "JKT-031", warehouse: "East Hub", quantity: 65, reserved: 8, status: "In_stock" },
];
