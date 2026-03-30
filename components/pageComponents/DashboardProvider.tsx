// "use client";

// import * as React from "react";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { AppSidebar } from "./AppSidebar";

// import { usePathname } from "next/navigation";
// import { ModeToggle } from "./ModeToggle";
// import UserButton from "./UserButton";

// type DashboardProviderProps = {
//   children: React.ReactNode;
// };

// // Helper function to capitalize the first letter of a string
// const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// export default function DashboardProvider({
//   children,
// }: DashboardProviderProps) {
//   const path = usePathname() || "/";
//   const pathSegments = path.split("/").filter(Boolean);

//   // Exclude login page from dashboard layout
//   if (path === "/admin") {
//     return <>{children}</>;
//   }

//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-40 justify-between">
//           <div className="flex items-center gap-2">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 {pathSegments.map((segment, index) => {
//                   const href = "/" + pathSegments.slice(0, index + 1).join("/");
//                   const isLast = index === pathSegments.length - 1;
//                   const label = capitalize(decodeURIComponent(segment));

//                   return (
//                     <React.Fragment key={index}>
//                       <BreadcrumbItem>
//                         {isLast ? (
//                           <BreadcrumbPage>{label}</BreadcrumbPage>
//                         ) : (
//                           <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
//                         )}
//                       </BreadcrumbItem>
//                       {!isLast && <BreadcrumbSeparator />}
//                     </React.Fragment>
//                   );
//                 })}
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//           <div className="flex items-center gap-2 pr-4">
//             <UserButton />
//             <ModeToggle />
//           </div>
//         </header>
//         <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import UserButton from "./UserButton";
import { cn } from "@/lib/utils";

type DashboardProviderProps = { children: React.ReactNode };

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

// Nicer labels for known route segments
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  "create-exam": "Create Exam",
  exam: "Exams",
  results: "Results",
  sections: "Section Templates",
  seb: "SEB Config",
  "manage-admins": "Manage Admins",
  academic: "Academic",
  "add-questions": "Add Questions",
  "edit-exam": "Edit Exam",
};

function getLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment.toLowerCase()] ??
    capitalize(decodeURIComponent(segment))
  );
}

export default function DashboardProvider({
  children,
}: DashboardProviderProps) {
  const path = usePathname() || "/";
  const pathSegments = path.split("/").filter(Boolean);

  // Pass through to children for the login/landing page
  if (path === "/admin") return <>{children}</>;

  // Collapse middle segments on mobile: show first + last only
  const isMobileCollapsed = pathSegments.length > 2;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* ── Header ─────────────────────────────────────── */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4">
          {/* Left: trigger + breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0">
            <SidebarTrigger className="shrink-0 -ml-0.5 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" />
            <Separator orientation="vertical" className="h-4 mx-1 shrink-0" />

            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap">
                {pathSegments.map((segment, index) => {
                  const href = "/" + pathSegments.slice(0, index + 1).join("/");
                  const isLast = index === pathSegments.length - 1;
                  const isFirst = index === 0;
                  const label = getLabel(segment);

                  // On mobile: hide middle segments, show ellipsis if needed
                  const hideOnMobile = isMobileCollapsed && !isFirst && !isLast;

                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem
                        className={cn(
                          "transition-opacity",
                          hideOnMobile && "hidden sm:flex",
                        )}
                      >
                        {isLast ? (
                          <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                            {label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={href}
                            className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[80px] sm:max-w-none"
                          >
                            {label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>

                      {/* Separator — hide if next item is hidden on mobile */}
                      {!isLast && (
                        <BreadcrumbSeparator
                          className={cn(
                            hideOnMobile
                              ? "hidden sm:flex"
                              : // Also hide the separator BEFORE the last visible item on mobile
                                isMobileCollapsed &&
                                  index === pathSegments.length - 2
                                ? "hidden sm:flex"
                                : "",
                          )}
                        />
                      )}

                      {/* Ellipsis for hidden middle segments on mobile */}
                      {isMobileCollapsed && isFirst && (
                        <React.Fragment>
                          <BreadcrumbSeparator className="sm:hidden" />
                          <BreadcrumbItem className="sm:hidden">
                            <span className="text-muted-foreground text-xs px-1">
                              …
                            </span>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="sm:hidden" />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: user + mode toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <UserButton />
            <ModeToggle />
          </div>
        </header>

        {/* ── Page content ───────────────────────────────── */}
        <div className="flex flex-1 flex-col min-h-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
