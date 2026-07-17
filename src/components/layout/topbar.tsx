"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderSearch } from "@/components/layout/header-search";
import { notificationService } from "@/services/notification.service";
import { uploadUrl } from "@/lib/http";
import type { Notification } from "@/types/notification";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar() {
  const router = useRouter();
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await notificationService.list({ limit: 10, seen: 0 });
        setNotifications(items);
      } catch {
        // non-fatal — the bell just shows no unread notifications
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMarkSeen = async (id: number) => {
    try {
      await notificationService.markSeen(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // non-fatal — worst case the notification just stays in the list
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-5" />

      <HeaderSearch />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="size-4" />
                {notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex flex-col items-start gap-0.5 py-2"
                  onClick={() => handleMarkSeen(n.id)}
                >
                  <span className="text-sm font-medium">{n.n_title}</span>
                  <span className="text-xs text-muted-foreground">{n.n_desc}</span>
                  <span className="text-[11px] text-muted-foreground/70">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link href="/notifications" className="justify-center text-sm font-medium">
                  View all notifications
                </Link>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  {admin?.image && <AvatarImage src={uploadUrl("admins", admin.image) ?? undefined} alt={admin.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(admin?.name ?? "Admin")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">{admin?.name ?? "Admin"}</span>
              <span className="text-xs font-normal text-muted-foreground">{admin?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link href="/profile">
                  <UserIcon />
                  Profile
                </Link>
              }
            />
            <DropdownMenuItem
              render={
                <Link href="/settings">
                  <Settings />
                  Store settings
                </Link>
              }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
