"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";

import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

export interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  // Controlled — mirrors the plain `value`/`onValueChange` string contract of
  // the shadcn `Select` wrapper (see ui/select.tsx) so either component can
  // be swapped in at a call site without touching surrounding state.
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  // Uncontrolled — participates in native form submission via `name`, same
  // as `Select`'s `name`/`defaultValue` pattern.
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  emptyText?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

// A searchable dropdown (base-ui's Combobox) wrapped to plug into the same
// call-site shape as `Select` — for pickers backed by lists long enough that
// scrolling to find an entry is worse than typing to filter it (products,
// countries/states, categories, brands). Not a replacement for `Select`
// everywhere: small fixed lists (Active/Inactive, order status) stay plain
// `Select` since a search box there would be pure overhead.
export function Combobox({
  items,
  value,
  onValueChange,
  defaultValue,
  name,
  placeholder = "Search...",
  emptyText = "No results found.",
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: ComboboxProps) {
  const isControlled = value !== undefined;

  const selectedItem = isControlled ? (items.find((i) => i.value === value) ?? null) : undefined;
  const initialItem = !isControlled && defaultValue !== undefined
    ? (items.find((i) => i.value === defaultValue) ?? null)
    : undefined;

  return (
    <ComboboxPrimitive.Root
      items={items}
      name={name}
      disabled={disabled}
      // Always wired, regardless of controlled/uncontrolled — some callers
      // are uncontrolled (name+defaultValue, read via FormData on submit)
      // but still want a change callback for side effects like clearing a
      // field-level validation error, not for driving the selected value.
      onValueChange={(next: ComboboxItem | null) => onValueChange?.(next?.value ?? null)}
      {...(isControlled ? { value: selectedItem } : { defaultValue: initialItem })}
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          "flex h-8 w-full items-center gap-1.5 rounded-lg border border-input bg-transparent pl-2.5 pr-2 text-sm transition-colors outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
          className
        )}
        aria-invalid={ariaInvalid}
      >
        <ComboboxPrimitive.Input
          id={id}
          placeholder={placeholder}
          className="h-full w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <ComboboxPrimitive.Clear
          className="flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Clear selection"
        >
          <XIcon className="size-3.5" />
        </ComboboxPrimitive.Clear>
        <ComboboxPrimitive.Icon className="flex shrink-0 items-center justify-center text-muted-foreground">
          <ChevronsUpDownIcon className="size-4" />
        </ComboboxPrimitive.Icon>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="z-50 outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="max-h-[min(20rem,var(--available-height))] w-(--anchor-width) max-w-(--available-width) overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <ComboboxPrimitive.Empty className="py-4 text-center text-sm text-muted-foreground">
              {emptyText}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="p-1">
              {(item: ComboboxItem) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className="relative flex cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span>{item.label}</span>
                  <ComboboxPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
