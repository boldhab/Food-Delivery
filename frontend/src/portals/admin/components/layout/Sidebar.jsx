import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarPrimitive,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NavUser } from "./nav-user";
import { adminNavigationSections } from "./navigationConfig";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useAdminDataContext } from "../../context/adminDataContextCore";

// 2B. Micro-interaction: Hover accent indicator (Left 3px vertical accent bar + tracking)
const navItemTransition =
  "transition-[width,height,padding,opacity,background-color,color,border-color,letter-spacing] duration-200 motion-reduce:transition-none";
const navHover = cn(
  "relative",
  "before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[3px] before:rounded-none before:bg-primary before:opacity-0",
  "hover:before:opacity-100 hover:tracking-wide hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
);
const navHoverClasses = cn(navItemTransition, navHover);

// Safe regex-based match highlighting without innerHTML
const highlightMatch = (text, query) => {
  if (!query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-primary/25 text-primary font-bold px-0.5 rounded-xs"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const Sidebar = ({
  collapsible = "icon",
  className,
  ...props
}) => {
  const { open, state, isMobile, setOpen, setOpenMobile, toggleSidebar } = useSidebar();
  const { user, hasPermission } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMenus, setExpandedMenus] = useState([
    "Orders",
    "Food Items",
    "Users & Fleet",
  ]);

  // Read live operational data from Context API
  let adminDataState = null;
  try {
    const dataContext = useAdminDataContext();
    adminDataState = dataContext?.state;
  } catch (err) {
    // Graceful fallback outside provider
  }

  const ordersList = adminDataState?.orders;
  const pendingOrdersCount = Array.isArray(ordersList)
    ? ordersList.filter((o) => o.orderStatus === "pending").length
    : 0;

  const activeDeliveriesCount = Array.isArray(ordersList)
    ? ordersList.filter((o) => o.orderStatus === "out_for_delivery").length
    : 0;

  // Resolve dynamic badges for navigation items
  const resolveBadge = (item) => {
    if (item.badgeKey === "pendingOrders") {
      return pendingOrdersCount > 0 ? pendingOrdersCount : null;
    }
    if (item.badgeKey === "activeDeliveries") {
      return activeDeliveriesCount > 0 ? `${activeDeliveriesCount} Active` : "LIVE";
    }
    return item.badge || null;
  };

  // Helper for route active detection
  const isRouteActive = (path, exact) => {
    if (exact || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check if a parent menu contains the active route
  const isParentActive = (item) => {
    if (isRouteActive(item.path, item.exact)) return true;
    if (item.children) {
      return item.children.some((child) => isRouteActive(child.path, child.exact));
    }
    return false;
  };

  // Auto-expand parent menu matching the current active route
  useEffect(() => {
    const currentPath = location.pathname;
    adminNavigationSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((c) =>
            isRouteActive(c.path, c.exact)
          );
          if (hasActiveChild && !expandedMenus.includes(item.label)) {
            setExpandedMenus((prev) => [...prev, item.label]);
          }
        }
      });
    });
  }, [location.pathname]);

  // Section 11 & Section 3.2: Auto-Scroll to Active Item (contained to sidebar)
  useEffect(() => {
    if (!open) return;
    const container = document.querySelector('[data-sidebar="content"]');
    if (!container) return;
    const timeoutId = window.setTimeout(() => {
      const active =
        container.querySelector('[data-active="true"]') ??
        container.querySelector(".bg-primary");
      if (active && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
          container.scrollTo({
            top: active.offsetTop - container.offsetTop - 20,
            behavior: "smooth"
          });
        }
      }
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [open, location.pathname]);

  const isItemVisible = (item) => {
    if (!item.permissions) return true;
    return item.permissions.every((p) => (hasPermission ? hasPermission(p) : true));
  };

  // Section 7: Live Search Filtering & Auto-expand matching parents
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchingParents = [];
      adminNavigationSections.forEach((section) => {
        section.items.forEach((item) => {
          if (
            item.children?.some(
              (c) =>
                c.label.toLowerCase().includes(q) ||
                item.label.toLowerCase().includes(q)
            )
          ) {
            matchingParents.push(item.label);
          }
        });
      });
      if (matchingParents.length > 0) {
        setExpandedMenus((prev) =>
          Array.from(new Set([...prev, ...matchingParents]))
        );
      }
    }
  }, [searchQuery]);

  const toggleSubmenu = (label) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return adminNavigationSections
        .map((sec) => ({
          ...sec,
          items: sec.items.filter(isItemVisible),
        }))
        .filter((sec) => sec.items.length > 0);
    }

    const q = searchQuery.toLowerCase().trim();
    return adminNavigationSections
      .map((section) => {
        const visibleItems = section.items.filter(isItemVisible);
        const matchedItems = visibleItems
          .map((item) => {
            const labelMatches = item.label.toLowerCase().includes(q);
            const matchingChildren = item.children?.filter((c) =>
              c.label.toLowerCase().includes(q)
            );

            if (labelMatches) {
              return item;
            }
            if (matchingChildren && matchingChildren.length > 0) {
              return {
                ...item,
                children: matchingChildren,
              };
            }
            return null;
          })
          .filter(Boolean);

        return {
          ...section,
          items: matchedItems,
        };
      })
      .filter((sec) => sec.items.length > 0);
  }, [searchQuery, pendingOrdersCount, activeDeliveriesCount]);

  const totalFilteredItemsCount = filteredSections.reduce(
    (acc, sec) => acc + sec.items.length,
    0
  );

  const handleOpenSearchFromCollapsed = () => {
    setOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  return (
    <SidebarPrimitive
      collapsible={collapsible}
      className={cn("border-sidebar-border bg-sidebar select-none transition-colors duration-200", className)}
      {...props}
    >
      {/* Section 4: Floating Collapse/Expand Toggle
          Anchored on the outer edge, vertically centered at 50% of the sidebar height.
          Moves with the sidebar edge, has hover/focus states, and left/right chevrons. */}
      <Button
        size="icon"
        variant="outline"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md z-50 size-7 h-7 w-7",
          "bg-sidebar border border-sidebar-border text-sidebar-foreground",
          "hover:bg-sidebar-accent hover:text-primary hover:border-primary/50",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
          "hidden md:flex items-center justify-center p-0 cursor-pointer transition-transform duration-200"
        )}
        onClick={toggleSidebar}
        aria-label={open ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
        title={open ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
      >
        {open ? (
          <ChevronLeft className="size-4 transition-transform duration-200" />
        ) : (
          <ChevronRight className="size-4 transition-transform duration-200" />
        )}
        <span className="sr-only">
          {open ? "Collapse sidebar" : "Expand sidebar"}
        </span>
      </Button>

      {/* Section 9: SidebarHeader: Logo + Name + Version tag + Live Search */}
      <SidebarHeader className="border-b border-sidebar-border/70 p-3 pb-2 gap-2.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0 flex items-center justify-center size-9 rounded-xl bg-white dark:bg-sidebar-accent border border-sidebar-border shadow-xs p-1">
              <img src="/LOGO.png" alt="Food Hub Admin" className="size-full object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
            </div>

            <div className="min-w-0 flex flex-col group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-sidebar-foreground truncate">
                  Food Hub
                </span>
                <span className="px-1.5 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/25">
                  HQ
                </span>
              </div>
              <p className="text-2xs uppercase tracking-wider text-sidebar-foreground/60 truncate">
                Command Center
              </p>
            </div>
          </div>

          <div className="group-data-[collapsible=icon]:hidden shrink-0">
            <span className="font-mono text-2xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              v2.4.0
            </span>
          </div>
        </div>

        {/* Section 7: In-Sidebar Live Search */}
        <div className="group-data-[collapsible=icon]:hidden pt-1">
          <div className="relative flex items-center px-1">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-sidebar-foreground/60" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
              placeholder="Search navigation..."
              aria-label="Search navigation"
              className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar px-8 text-xs text-sidebar-foreground outline-none transition-all placeholder:text-sidebar-foreground/50 focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-sidebar-foreground/60 hover:text-sidebar-foreground cursor-pointer"
                title="Clear search (Esc)"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search trigger when collapsed */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleOpenSearchFromCollapsed}
                className="flex items-center justify-center size-8 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer transition-colors"
                aria-label="Search navigation (Ctrl+B to expand)"
              >
                <Search className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Search navigation</TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      {/* Section 3 & 11: SidebarContent (scrollable): Multi-level accordion menu items */}
      <SidebarContent data-sidebar="content" className="px-2 py-2 gap-3">
        {totalFilteredItemsCount === 0 && searchQuery && (
          <div className="p-4 text-center">
            <Search className="size-6 text-sidebar-foreground/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-sidebar-foreground/70">
              No matching navigation found
            </p>
            <p className="text-2xs text-sidebar-foreground/60 mt-0.5">
              Try searching with another keyword
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        )}

        {filteredSections.map((section) => (
          <SidebarGroup key={section.id} className="p-0">
            <SidebarGroupLabel className="px-2 text-2xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 opacity-80">
              {section.title}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMenus.includes(item.label);
                  const isDirectActive = isRouteActive(item.path, item.exact);
                  const isParentRouteActive = isParentActive(item);
                  const badgeValue = resolveBadge(item);

                  // 1. Collapsed Desktop Mode: Icons only with Tooltips & Flyout Dropdown for submenus
                  if (state === "collapsed" && !isMobile) {
                    if (hasChildren) {
                      return (
                        <SidebarMenuItem key={item.id}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton
                                isActive={isParentRouteActive}
                                className={cn(
                                  navHoverClasses,
                                  isParentRouteActive &&
                                    "bg-primary text-primary-foreground font-semibold rounded-none hover:bg-primary hover:text-primary-foreground"
                                )}
                              >
                                <item.icon className="size-4 shrink-0" />
                                <span>{item.label}</span>
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              className="min-w-52 bg-sidebar border border-sidebar-border shadow-xl p-1"
                            >
                              <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-bold text-sidebar-foreground border-b border-sidebar-border/60 mb-1 flex items-center justify-between">
                                <span>{item.label}</span>
                                {badgeValue && (
                                  <span className="text-2xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums bg-primary/15 text-primary">
                                    {badgeValue}
                                  </span>
                                )}
                              </DropdownMenuLabel>
                              {item.children.map((child) => {
                                const isChildActive = isRouteActive(child.path, child.exact);
                                const childBadge = resolveBadge(child);
                                return (
                                  <DropdownMenuItem
                                    key={child.id}
                                    onClick={() => navigate(child.path)}
                                    className={cn(
                                      "cursor-pointer text-xs flex items-center justify-between px-2.5 py-1.5",
                                      isChildActive
                                        ? "bg-primary text-primary-foreground font-semibold rounded-none"
                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <child.icon className="size-3.5 opacity-70" />
                                      <span>{child.label}</span>
                                    </div>
                                    {childBadge && (
                                      <span className="text-2xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                        {childBadge}
                                      </span>
                                    )}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuItem>
                      );
                    }

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isDirectActive}
                          tooltip={item.label}
                          className={cn(
                            navHoverClasses,
                            isDirectActive &&
                              "bg-primary text-primary-foreground font-semibold rounded-none hover:bg-primary hover:text-primary-foreground"
                          )}
                        >
                          <NavLink
                            to={item.path}
                            end={item.exact}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false);
                            }}
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // 2. Expanded Mode or Mobile Drawer Mode
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild={!hasChildren}
                        isActive={isDirectActive && !hasChildren}
                        onClick={
                          hasChildren
                            ? () => {
                                if (item.path && location.pathname !== item.path) {
                                  navigate(item.path);
                                }
                                toggleSubmenu(item.label);
                              }
                            : undefined
                        }
                        className={cn(
                          navHoverClasses,
                          isDirectActive && !hasChildren
                            ? "bg-primary text-primary-foreground font-semibold rounded-none hover:bg-primary hover:text-primary-foreground"
                            : isExpanded && hasChildren
                            ? "bg-sidebar-accent/50 text-sidebar-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        {hasChildren ? (
                          <div className="flex items-center w-full gap-2.5">
                            <item.icon className="size-4 shrink-0" />
                            <span className="flex-1 truncate tracking-tight text-xs font-semibold">
                              {highlightMatch(item.label, searchQuery)}
                            </span>
                            {badgeValue && (
                              <span className="relative right-0 top-0 inline-flex items-center">
                                {item.badgeType === "live" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider tabular-nums bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {badgeValue}
                                  </span>
                                ) : item.badgeType === "amber" ? (
                                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold tabular-nums bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    {badgeValue}
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-full text-2xs font-semibold tabular-nums bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                                    {badgeValue}
                                  </span>
                                )}
                              </span>
                            )}
                            <ChevronDown
                              className={cn(
                                "size-3.5 shrink-0 text-sidebar-foreground/60 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        ) : (
                          <NavLink
                            to={item.path}
                            end={item.exact}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false);
                            }}
                            className="flex items-center w-full gap-2.5"
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span className="flex-1 truncate tracking-tight text-xs font-semibold">
                              {highlightMatch(item.label, searchQuery)}
                            </span>
                            {badgeValue && (
                              <span className="relative right-0 top-0 inline-flex items-center">
                                {item.badgeType === "live" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider tabular-nums bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {badgeValue}
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-full text-2xs font-semibold tabular-nums bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                                    {badgeValue}
                                  </span>
                                )}
                              </span>
                            )}
                          </NavLink>
                        )}
                      </SidebarMenuButton>

                      {/* Section 5 & 2D: Nested Tree Lines for multi-level children */}
                      {hasChildren && isExpanded && (
                        <SidebarMenuSub className="border-l border-sidebar-border/60 ml-3 pl-4 mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const isChildActive = isRouteActive(child.path, child.exact);
                            const childBadge = resolveBadge(child);

                            return (
                              <SidebarMenuSubItem key={child.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isChildActive}
                                  className={cn(
                                    navHoverClasses,
                                    isChildActive
                                      ? "bg-primary text-primary-foreground font-semibold rounded-none hover:bg-primary hover:text-primary-foreground"
                                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                  )}
                                >
                                  <NavLink
                                    to={child.path}
                                    end={child.exact}
                                    onClick={() => {
                                      if (isMobile) setOpenMobile(false);
                                    }}
                                    className="flex items-center justify-between w-full"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      {child.icon ? (
                                        <child.icon className="size-3.5 opacity-60 shrink-0" />
                                      ) : (
                                        <span className="size-1 rounded-none bg-current opacity-60 shrink-0" />
                                      )}
                                      <span className="truncate text-xs font-medium">
                                        {highlightMatch(child.label, searchQuery)}
                                      </span>
                                    </div>
                                    {childBadge && (
                                      <span className="px-1.5 py-0.5 rounded-full text-2xs font-semibold tabular-nums bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                                        {childBadge}
                                      </span>
                                    )}
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Section 10: SidebarFooter: NavUser (Avatar, Name, Handle, Radix dropdown) */}
      <SidebarFooter className="border-t border-sidebar-border/70 p-2">
        <NavUser user={user} />
      </SidebarFooter>
    </SidebarPrimitive>
  );
};

export default Sidebar;
