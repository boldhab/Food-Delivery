import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useTheme } from "@/shared/context/ThemeContext";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const { logout } = useAdminAuth();
  const { theme, resolvedTheme, cycleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const displayName = user?.name || "System Admin";
  const displayEmail = user?.email || "admin@foodiehub.com";
  const displayHandle = user?.handle || `@${(user?.name || "admin").toLowerCase().replace(/\s+/g, "")}`;
  const initial = (displayName.charAt(0) || "A").toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group hover:bg-sidebar-accent transition-colors"
            >
              <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-xs shadow-xs">
                {initial}
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {displayHandle}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border border-sidebar-border bg-sidebar p-1 shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-xs shadow-xs">
                  {initial}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {displayName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {user?.role || "HQ"}
                    </span>
                  </div>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={cycleTheme}
                className="cursor-pointer gap-2.5"
              >
                {resolvedTheme === "dark" ? (
                  <Moon className="size-4 text-slate-400" />
                ) : theme === "system" ? (
                  <Monitor className="size-4 text-blue-400" />
                ) : (
                  <Sun className="size-4 text-amber-500" />
                )}
                <div className="flex items-center justify-between flex-1">
                  <span>Theme: <span className="capitalize font-semibold">{theme}</span></span>
                  <span className="text-2xs text-sidebar-foreground/60 uppercase tracking-wider">Switch</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/admin/profile")}
                className="cursor-pointer gap-2.5"
              >
                <User className="size-4 text-sidebar-foreground/70" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/admin/settings")}
                className="cursor-pointer gap-2.5"
              >
                <Settings className="size-4 text-sidebar-foreground/70" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/admin/messages")}
                className="cursor-pointer gap-2.5"
              >
                <Bell className="size-4 text-sidebar-foreground/70" />
                <span>Notifications & Alerts</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer gap-2.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default NavUser;
