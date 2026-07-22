import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  FolderTree,
  BadgeCheck,
  SlidersHorizontal,
  Package,
  Tag,
  Warehouse,
  GalleryHorizontal,
  Ticket,
  ShoppingCart,
  Users,
  Star,
  Repeat,
  Gift,
  Contact,
  FileText,
  MapPin,
  Bell,
  Settings,
  ShieldCheck,
  MailWarning,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Mirrors the admin route prefixes registered in `backed/src/modules/*/**.module.js`.
// Sub-resources of a module (e.g. banners' 6 routes, locations' 10 routes) are grouped
// into a single nav item and split into tabs inside that page instead of one link each.
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Categories", href: "/categories", icon: FolderTree },
      { title: "Brands", href: "/brands", icon: BadgeCheck },
      { title: "Attributes", href: "/attributes", icon: SlidersHorizontal },
      { title: "Products", href: "/products", icon: Package },
      { title: "Tags", href: "/tags", icon: Tag },
      { title: "Stock", href: "/stock", icon: Warehouse },
      { title: "Stock Alerts", href: "/stock-alerts", icon: MailWarning },
    ],
  },
  {
    label: "Marketing",
    items: [
      { title: "Banners", href: "/banners", icon: GalleryHorizontal },
      { title: "Coupons", href: "/coupons", icon: Ticket },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", href: "/orders", icon: ShoppingCart, badge: "12" },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Reviews", href: "/reviews", icon: Star },
      { title: "Exchanges", href: "/exchanges", icon: Repeat },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Rewards", href: "/rewards", icon: Gift },
      { title: "Leads", href: "/leads", icon: Contact },
    ],
  },
  {
    label: "Content",
    items: [{ title: "CMS Pages", href: "/cms", icon: FileText }],
  },
  {
    label: "Configuration",
    items: [
      { title: "Locations", href: "/locations", icon: MapPin },
      { title: "Admins", href: "/admins", icon: ShieldCheck },
      { title: "Notifications", href: "/notifications", icon: Bell, badge: "3" },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
