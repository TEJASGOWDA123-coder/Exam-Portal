"use client";

// import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

export function NavMain({ items }: { items: any }) {
  const { state } = useSidebar();
  const path = usePathname();
  const { theme } = useTheme();
  // console.log("themes", theme);
  // console.log("state", state);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item: any) => {
          const isActive = path === item.url || path.startsWith(`${item.url}/`);

          return (
            <SidebarMenuItem
              key={item.title}
              className="group/menu-item relative"
            >
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={`z-30 h-12 w-full px-3 flex items-center gap-2 transition-all *:
                  
                  ${state === "collapsed" ? "my-1.5" : ""}
                  
                  ${
                    isActive
                      ? `font-semibold bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white hover:bg-emerald-600 hover:text-white  ${
                          theme === "light"
                            ? "hover:hover:bg-emerald-600 hover:text-white"
                            : ""
                        }  `
                      : "text-foreground hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white"
                  }`}
              >
                <Link
                  href={item.url}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-2 w-full px-3"
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {state !== "collapsed" && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
