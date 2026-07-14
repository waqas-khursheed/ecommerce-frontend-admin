import { createCrudService } from "@/lib/createCrudService";
import type { Stock, StockFormValues } from "@/types/stock";

export const stockService = createCrudService<Stock, StockFormValues, StockFormValues>("/admin/stock", {
  listKey: "stocks",
});
