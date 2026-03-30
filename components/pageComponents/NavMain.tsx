// "use client";

// // import { type LucideIcon } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// import {
//   SidebarGroup,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { useTheme } from "next-themes";

// export function NavMain({ items }: { items: any }) {
//   const { state } = useSidebar();
//   const path = usePathname();
//   const { theme } = useTheme();
//   // console.log("themes", theme);
//   // console.log("state", state);

//   return (
//     <SidebarGroup>
//       <SidebarMenu>
//         {items.map((item: any) => {
//           const isActive = path === item.url || path.startsWith(`${item.url}/`);

//           return (
//             <SidebarMenuItem
//               key={item.title}
//               className="group/menu-item relative"
//             >
//               <SidebarMenuButton
//                 tooltip={item.title}
//                 asChild
//                 className={`z-30 h-12 w-full px-3 flex items-center gap-2 transition-all *:

//                   ${state === "collapsed" ? "my-1.5" : ""}

//                   ${
//                     isActive
//                       ? `font-semibold bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white hover:bg-emerald-600 hover:text-white  ${
//                           theme === "light"
//                             ? "hover:hover:bg-emerald-600 hover:text-white"
//                             : ""
//                         }  `
//                       : "text-foreground hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white"
//                   }`}
//               >
//                 <Link
//                   href={item.url}
//                   aria-current={isActive ? "page" : undefined}
//                   className="flex items-center gap-2 w-full px-3"
//                 >
//                   {item.icon && (
//                     <item.icon className="h-4 w-4" aria-hidden="true" />
//                   )}
//                   {state !== "collapsed" && <span>{item.title}</span>}
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           );
//         })}
//       </SidebarMenu>
//     </SidebarGroup>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ElementType;
  badge?: string | null;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const { state } = useSidebar();
  const path = usePathname();
  const collapsed = state === "collapsed";

  return (
    <SidebarGroup className="px-2 py-1">
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const isActive = path === item.url || path.startsWith(`${item.url}/`);
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={isActive}
                className={cn(
                  // Base
                  "relative h-9 w-full rounded-xl px-3",
                  "flex items-center gap-2.5",
                  "text-sm font-medium",
                  "transition-all duration-150 ease-out",
                  "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  collapsed && "h-9 justify-center px-0",
                  // Inactive
                  !isActive && [
                    "text-sidebar-foreground/70",
                    "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  ],
                  // Active
                  isActive && [
                    "bg-primary text-primary-foreground font-semibold",
                    "hover:bg-primary/90 hover:text-primary-foreground",
                    "shadow-sm shadow-primary/20",
                  ],
                )}
              >
                <Link
                  href={item.url}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-2.5 w-full min-w-0"
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "shrink-0 transition-transform duration-150",
                        collapsed ? "h-4 w-4" : "h-4 w-4",
                        isActive
                          ? "text-primary-foreground"
                          : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {!collapsed && (
                    <span className="truncate leading-none">{item.title}</span>
                  )}
                </Link>
              </SidebarMenuButton>

              {/* Badge — only shown when expanded */}
              {!collapsed && item.badge && (
                <SidebarMenuBadge
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : item.badge === "Beta"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
