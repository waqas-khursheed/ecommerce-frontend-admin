import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopProduct {
  name: string;
  price: number;
  category: string;
  quantity: number;
  amount: number;
}

interface TopProductsTableProps {
  title?: string;
  description?: string;
  products: TopProduct[];
}

export function TopProductsTable({
  title = "Top Selling Products",
  description = "Best performers this month",
  products,
}: TopProductsTableProps) {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.name}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">{product.category}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell className="text-right">${product.amount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
