"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { AvatarCell } from "@/components/data-table/avatar-cell";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderService } from "@/services/order.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_OPTIONS, type Order, type PaymentStatus } from "@/types/order";

function formatHistoryValue(field: string, value: string) {
  if (field === "status") return ORDER_STATUS_LABELS[Number(value)] ?? value;
  return value;
}

export default function OrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      const { items } = await orderService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load orders"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await orderService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load orders"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openOrder = async (id: number) => {
    setOpen(true);
    setViewing(null);
    try {
      const order = await orderService.getById(id);
      setViewing(order);
      if (!order.seen) {
        await orderService.markSeen(id);
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, seen: 1 } : r)));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load order"));
      setOpen(false);
    }
  };

  const handleStatusChange = async (status: string | null) => {
    if (!viewing || !status) return;
    setIsUpdating(true);
    try {
      const updated = await orderService.updateStatus(viewing.id, Number(status));
      setViewing((prev) => (prev ? { ...prev, status: updated.status } : prev));
      setRows((prev) => prev.map((r) => (r.id === viewing.id ? { ...r, status: updated.status } : r)));
      toast.success("Order status updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (payment_status: string | null) => {
    if (!viewing || !payment_status) return;
    setIsUpdating(true);
    try {
      const updated = await orderService.updatePaymentStatus(viewing.id, payment_status as PaymentStatus);
      setViewing((prev) => (prev ? { ...prev, payment_status: updated.payment_status } : prev));
      setRows((prev) =>
        prev.map((r) => (r.id === viewing.id ? { ...r, payment_status: updated.payment_status } : r))
      );
      toast.success("Payment status updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update payment status"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await orderService.remove(deletingId);
      toast.success("Order deleted");
      await loadOrders();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete order"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      { accessorKey: "order_number", header: "Order" },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <AvatarCell
            name={
              row.original.user
                ? `${row.original.user.first_name} ${row.original.user.last_name}`
                : "Guest"
            }
            subtitle={row.original.user?.email}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={ORDER_STATUS_LABELS[getValue() as number] ?? "Unknown"} />
        ),
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: "grand_total",
        header: "Amount",
        cell: ({ getValue }) => <span className="font-semibold">${Number(getValue()).toFixed(2)}</span>,
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "seen",
        header: "Seen",
        cell: ({ getValue }) => (getValue() ? "" : <span className="size-2 rounded-full bg-blue-500 inline-block" />),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => openOrder(row.original.id)}>
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-red-600 hover:text-red-600"
              onClick={() => setDeletingId(row.original.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Manage and track all customer orders."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Orders" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search by order number..."
        searchColumn="order_number"
      />

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setViewing(null); }}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{viewing ? `Order ${viewing.order_number}` : "Loading..."}</SheetTitle>
            <SheetDescription>Order details, items and billing information.</SheetDescription>
          </SheetHeader>

          {viewing && (
            <div className="flex-1 space-y-5 px-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Order Status</label>
                  <Select value={String(viewing.status)} onValueChange={handleStatusChange} disabled={isUpdating}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select
                    value={viewing.payment_status}
                    onValueChange={handlePaymentStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="capitalize">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <p className="font-medium">Customer</p>
                <p className="text-muted-foreground">
                  {viewing.user ? `${viewing.user.first_name} ${viewing.user.last_name}` : "Guest"}
                  {viewing.user?.email ? ` — ${viewing.user.email}` : ""}
                </p>
                <p className="text-muted-foreground">Payment method: {viewing.pay_method}</p>
              </div>

              {viewing.billingDetails?.[0] && (
                <>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Billing Address</p>
                    <p className="text-muted-foreground">
                      {viewing.billingDetails[0].firstname} {viewing.billingDetails[0].lastname}
                    </p>
                    <p className="text-muted-foreground">{viewing.billingDetails[0].address_1}</p>
                    {viewing.billingDetails[0].address_2 && (
                      <p className="text-muted-foreground">{viewing.billingDetails[0].address_2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {viewing.billingDetails[0].city}, {viewing.billingDetails[0].state},{" "}
                      {viewing.billingDetails[0].country} {viewing.billingDetails[0].postcode}
                    </p>
                    <p className="text-muted-foreground">{viewing.billingDetails[0].phone}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Items</p>
                <div className="space-y-2">
                  {viewing.orderDetails?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <div>
                        <p className="font-medium">{item.product?.title ?? `Product #${item.product_id}`}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity} × ${Number(item.dis_price).toFixed(2)}</p>
                      </div>
                      <span className="font-semibold">${Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(viewing.sub_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${Number(viewing.shipping).toFixed(2)}</span>
                </div>
                {!!viewing.coupon_discount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coupon ({viewing.coupon_title})</span>
                    <span>-${Number(viewing.coupon_discount).toFixed(2)}</span>
                  </div>
                )}
                {!!viewing.rewards_discount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rewards discount</span>
                    <span>-${Number(viewing.rewards_discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold">
                  <span>Grand Total</span>
                  <span>${Number(viewing.grand_total).toFixed(2)}</span>
                </div>
              </div>

              {!!viewing.statusHistory?.length && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">History</p>
                    <div className="space-y-3">
                      {viewing.statusHistory.map((h) => (
                        <div key={h.id} className="flex gap-2 text-sm">
                          <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                          <div>
                            <p>
                              <span className="font-medium">
                                {h.field === "status" ? "Order status" : "Payment status"}
                              </span>{" "}
                              changed
                              {h.from_value ? ` from ${formatHistoryValue(h.field, h.from_value)}` : ""} to{" "}
                              <span className="font-medium">{formatHistoryValue(h.field, h.to_value)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.created_at).toLocaleString()}
                              {h.changedByAdmin ? ` — by ${h.changedByAdmin.name}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <SheetFooter>
            <SheetClose render={<Button variant="outline">Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this order?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
