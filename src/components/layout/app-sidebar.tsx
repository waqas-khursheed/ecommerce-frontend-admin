"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Zap } from "lucide-react";

import { NAV_SECTIONS } from "@/config/nav";
import { useAuthStore } from "@/store/auth.store";
import { webSettingService } from "@/services/setting.service";
import { uploadUrl } from "@/lib/http";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);

  useEffect(() => {
    webSettingService
      .get()
      .then((setting) => {
        setLogoUrl(uploadUrl("settings", setting?.main_logo ?? undefined));
        setSiteName(setting?.website_name ?? null);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName ?? "Store logo"} className="size-11 shrink-0 rounded-lg object-contain" />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" fill="currentColor" />
            </div>
          )}
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">{siteName ?? "Ecommerce"}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        }
                      />
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg">
                <Avatar className="size-7 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                    {initials(admin?.name ?? "Admin")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{admin?.name ?? "Admin"}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {admin?.email ?? ""}
                  </span>
                </div>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
