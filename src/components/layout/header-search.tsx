"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, ShoppingCart, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { orderService } from "@/services/order.service";
import { userService } from "@/services/user.service";
import type { Order } from "@/types/order";
import type { Customer } from "@/types/customer";

// Global quick-search — Orders (by order number) + Customers (by name/email).
// Both list endpoints already support `?search=` server-side (order.service.js
// filters order_number, user.service.js filters first/last name + email), so
// this is purely a frontend wiring job, not a new backend query.
export function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setOrders([]);
      setCustomers([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [orderResult, customerResult] = await Promise.all([
          orderService.list({ search: trimmed, limit: 5 }),
          userService.list({ search: trimmed, limit: 5 }),
        ]);
        setOrders(orderResult.items);
        setCustomers(customerResult.items);
        setIsOpen(true);
      } catch {
        // non-fatal — quick search just shows no results
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToOrder = (order: Order) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/orders?search=${encodeURIComponent(order.order_number)}`);
  };

  const goToCustomer = (customer: Customer) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/customers?search=${encodeURIComponent(customer.email)}`);
  };

  const hasResults = orders.length > 0 || customers.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search orders, customers..."
        className="pl-8 pr-12"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
      />
      {isLoading ? (
        <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}

      {isOpen && (
        <div className="absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border bg-popover shadow-md ring-1 ring-foreground/10">
          {!hasResults ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matches for &quot;{query}&quot;</p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {orders.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Orders</p>
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => goToOrder(order)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <ShoppingCart className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">#{order.order_number}</span>
                      <span className="shrink-0 text-muted-foreground">${Number(order.grand_total).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
              {customers.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Customers</p>
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => goToCustomer(customer)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {customer.first_name} {customer.last_name}
                      </span>
                      <span className="shrink-0 truncate text-xs text-muted-foreground">{customer.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
