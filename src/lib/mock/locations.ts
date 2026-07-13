export interface LocationRow {
  id: number;
  name: string;
  code?: string;
  parent?: string;
  status: "Active" | "Inactive";
}

export const countries: LocationRow[] = [
  { id: 1, name: "United States", code: "US", status: "Active" },
  { id: 2, name: "United Kingdom", code: "UK", status: "Active" },
  { id: 3, name: "Canada", code: "CA", status: "Active" },
  { id: 4, name: "India", code: "IN", status: "Active" },
];

export const states: LocationRow[] = [
  { id: 1, name: "California", parent: "United States", status: "Active" },
  { id: 2, name: "New York", parent: "United States", status: "Active" },
  { id: 3, name: "Ontario", parent: "Canada", status: "Active" },
];

export const cities: LocationRow[] = [
  { id: 1, name: "San Francisco", parent: "California", status: "Active" },
  { id: 2, name: "Los Angeles", parent: "California", status: "Active" },
  { id: 3, name: "New York City", parent: "New York", status: "Active" },
];

export const geoZones: LocationRow[] = [
  { id: 1, name: "North America", status: "Active" },
  { id: 2, name: "Europe", status: "Active" },
  { id: 3, name: "Asia Pacific", status: "Active" },
];

export const productCityAssignments = [
  { id: 1, product: "Overshirt with pockets", city: "San Francisco", available: true },
  { id: 2, product: "Classic Shirt", city: "New York City", available: true },
  { id: 3, product: "Wool Sweater", city: "Los Angeles", available: false },
];
