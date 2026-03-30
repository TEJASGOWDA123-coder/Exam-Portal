// "use client";

// import * as React from "react";
// import {
//   BookOpen,
//   MessageCircle,
//   ShieldCheck,
//   Code,
//   Trophy,
//   FolderOpen,
//   Settings,
//   User,
//   SquareTerminal,
//   Brain,
//   Binoculars,
//   FileCode,
//   Sparkle,
//   LayoutDashboard,
//   FilePlus,
//   ClipboardList,
//   GraduationCap,
//   LayoutTemplate,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenuButton,
//   SidebarRail,
//   useSidebar,
// } from "@/components/ui/sidebar";
// // import { NavMain } from "./NavMain";
// import { motion } from "framer-motion";

// import Image from "next/image";
// import { NavMain } from "./NavMain";
// // import Subscribepart from "./Subscribepart";

// // Sidebar navigation data
// const data = {
//   navMain: [
//     {
//       title: "Dashboard",
//       url: "/admin/dashboard",
//       icon: LayoutDashboard,
//       badge: null,
//     },
//     {
//       title: "Create Exam",
//       url: "/admin/create-exam",
//       icon: FilePlus,
//       badge: "New",
//     },
//     {
//       title: "Exam",
//       url: "/admin/exam",
//       icon: Brain,
//       badge: null,
//     },
//     {
//       title: "Results",
//       url: "/admin/results",
//       icon: Trophy,
//       badge: null,
//     },
//     {
//       title: "Section Templates",
//       url: "/admin/sections",
//       icon: LayoutTemplate,
//       badge: null,
//     },
//     {
//       title: "SEB Config",
//       url: "/admin/seb",
//       icon: ShieldCheck,
//       badge: "Beta",
//     },
//     {
//       title: "Manage Admins",
//       url: "/admin/manage-admins",
//       icon: User,
//       badge: null,
//     },
//     {
//       title: "Academic",
//       url: "/admin/academic",
//       icon: User,
//       badge: null,
//     },
//   ],
// };

// export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
//   const { state } = useSidebar();
//   const buttonRef = React.useRef<HTMLButtonElement>(null);

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <SidebarMenuButton
//           size="lg"
//           className={`
//             group flex items-center gap-3 rounded-xl px-3 py-2
//             transition-all duration-200 ease-in-out
//             hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
//             data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
//             ${state === "collapsed" ? "justify-center px-0" : ""}
//           `}
//         >
//           <motion.div
//             whileHover={{ scale: 1.05, rotate: 2 }}
//             whileTap={{ scale: 0.95 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//           ></motion.div>
//           {state !== "collapsed" ? (
//             <div className="flex items-center gap-2 text-left">
//               <div className="bg-transparent dark:bg-white flex items-center justify-center w-fit h-fit rounded-lg">
//                 <Image src="/logo.webp" alt="Logo" width={200} height={200} />
//               </div>
//             </div>
//           ) : (
//             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
//               <GraduationCap className="w-6 h-6 text-primary" />
//             </div>
//           )}
//         </SidebarMenuButton>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={data.navMain} />
//       </SidebarContent>

//       <SidebarRail ref={buttonRef} />
//     </Sidebar>
//   );
// }

// "use client";

// import * as React from "react";
// import {
//   ShieldCheck,
//   Trophy,
//   User,
//   Brain,
//   LayoutDashboard,
//   FilePlus,
//   LayoutTemplate,
//   GraduationCap,
//   Building2,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenuButton,
//   SidebarRail,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { NavMain } from "./NavMain";
// import { cn } from "@/lib/utils";

// // ── Nav items ─────────────────────────────────────────────────────────────────
// const NAV_ITEMS = [
//   {
//     title: "Dashboard",
//     url: "/admin/dashboard",
//     icon: LayoutDashboard,
//     badge: null,
//   },
//   {
//     title: "Create Exam",
//     url: "/admin/create-exam",
//     icon: FilePlus,
//     badge: "New",
//   },
//   {
//     title: "Exams",
//     url: "/admin/exam",
//     icon: Brain,
//     badge: null,
//   },
//   {
//     title: "Results",
//     url: "/admin/results",
//     icon: Trophy,
//     badge: null,
//   },
//   {
//     title: "Section Templates",
//     url: "/admin/sections",
//     icon: LayoutTemplate,
//     badge: null,
//   },
//   {
//     title: "SEB Config",
//     url: "/admin/seb",
//     icon: ShieldCheck,
//     badge: "Beta",
//   },
//   {
//     title: "Manage Admins",
//     url: "/admin/manage-admins",
//     icon: User,
//     badge: null,
//   },
//   {
//     title: "Academic",
//     url: "/admin/academic",
//     icon: Building2,
//     badge: null,
//   },
// ];

// // ── Logo mark (collapsed icon) ────────────────────────────────────────────────
// function LogoMark() {
//   return (
//     <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
//       <GraduationCap className="w-4 h-4 text-primary" />
//     </div>
//   );
// }

// export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
//   const { state } = useSidebar();
//   const collapsed = state === "collapsed";
//   const buttonRef = React.useRef<HTMLButtonElement>(null);

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       {/* ── Header ─────────────────────────────── */}
//       <SidebarHeader className="border-b border-sidebar-border/50 pb-3">
//         <SidebarMenuButton
//           size="lg"
//           className={cn(
//             "group flex items-center gap-3 rounded-xl px-3 py-2",
//             "transition-all duration-200 ease-out",
//             "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
//             "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
//             collapsed && "justify-center px-1",
//           )}
//         >
//           {collapsed && (
//             <motion.div
//               whileHover={{ scale: 1.06 }}
//               whileTap={{ scale: 0.94 }}
//               transition={{ type: "spring", stiffness: 350, damping: 22 }}
//               className="shrink-0"
//             >
//               <LogoMark />
//             </motion.div>
//           )}

//           <AnimatePresence initial={false}>
//             {!collapsed && (
//               <motion.div
//                 key="logo-expanded"
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: 1, width: "auto" }}
//                 exit={{ opacity: 0, width: 0 }}
//                 transition={{ duration: 0.18, ease: "easeOut" }}
//                 className="overflow-hidden flex items-center gap-2 min-w-0"
//               >
//                 {/* Logo image — show if available, fall back to text */}
//                 <div className="dark:bg-white rounded-lg overflow-hidden shrink-0">
//                   <Image
//                     src="/logo.webp"
//                     alt="ExamPortal"
//                     width={120}
//                     height={32}
//                     className="h-8 w-auto object-contain"
//                     onError={() => {}} // silently fall back
//                   />
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </SidebarMenuButton>
//       </SidebarHeader>

//       {/* ── Nav ─────────────────────────────────── */}
//       <SidebarContent className="pt-2">
//         <NavMain items={NAV_ITEMS} />
//       </SidebarContent>

//       {/* ── Rail (collapse toggle) ──────────────── */}
//       <SidebarRail ref={buttonRef} />
//     </Sidebar>
//   );
// }

// "use client";

// import * as React from "react";
// import {
//   ShieldCheck,
//   Trophy,
//   User,
//   Brain,
//   LayoutDashboard,
//   FilePlus,
//   LayoutTemplate,
//   GraduationCap,
//   Building2,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarMenuButton,
//   SidebarRail,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { NavMain } from "./NavMain";
// import { cn } from "@/lib/utils";

// const NAV_ITEMS = [
//   {
//     title: "Dashboard",
//     url: "/admin/dashboard",
//     icon: LayoutDashboard,
//     badge: null,
//   },
//   {
//     title: "Create Exam",
//     url: "/admin/create-exam",
//     icon: FilePlus,
//     badge: "New",
//   },
//   { title: "Exams", url: "/admin/exam", icon: Brain, badge: null },
//   { title: "Results", url: "/admin/results", icon: Trophy, badge: null },
//   {
//     title: "Section Templates",
//     url: "/admin/sections",
//     icon: LayoutTemplate,
//     badge: null,
//   },
//   { title: "SEB Config", url: "/admin/seb", icon: ShieldCheck, badge: "Beta" },
//   {
//     title: "Manage Admins",
//     url: "/admin/manage-admins",
//     icon: User,
//     badge: null,
//   },
//   { title: "Academic", url: "/admin/academic", icon: Building2, badge: null },
// ];

// function LogoMark() {
//   return (
//     <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 transition-colors duration-150">
//       <GraduationCap className="w-4 h-4 text-primary" />
//     </div>
//   );
// }

// export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
//   const { state } = useSidebar();
//   const collapsed = state === "collapsed";

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader className="border-b border-sidebar-border/40">
//         <SidebarMenuButton
//           size="lg"
//           className={cn(
//             "group/header flex items-center gap-3 rounded-xl px-3 py-2.5",
//             "transition-all duration-200 ease-out",
//             "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
//             collapsed && "justify-center px-2",
//           )}
//         >
//           {/* Logo mark — always rendered, never disappears */}
//           {/* <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.93 }}
//             transition={{ type: "spring", stiffness: 380, damping: 24 }}
//             className="shrink-0"
//           >
//             <LogoMark />
//           </motion.div> */}

//           {/* Wordmark — slides in when expanded, out when collapsed */}
//           <AnimatePresence initial={false}>
//             {!collapsed ? (
//               <motion.div
//                 key="wordmark"
//                 initial={{ opacity: 0, x: -8 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -8 }}
//                 transition={{ duration: 0.15, ease: "easeOut" }}
//                 className="flex items-center overflow-hidden shrink-0"
//               >
//                 <div className="dark:bg-white/95 rounded-md overflow-hidden px-0.5 flex items-center justify-center">
//                   <Image
//                     src="/logo.webp"
//                     alt="ExamPortal"
//                     width={110}
//                     height={28}
//                     className="h-7 w-auto object-contain"
//                     priority
//                   />
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.93 }}
//                 transition={{ type: "spring", stiffness: 380, damping: 24 }}
//                 className="shrink-0"
//               >
//                 <LogoMark />
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </SidebarMenuButton>
//       </SidebarHeader>

//       <SidebarContent className="pt-1.5">
//         <NavMain items={NAV_ITEMS} />
//       </SidebarContent>

//       {/* No ref — SidebarRail doesn't forward refs */}
//       <SidebarRail />
//     </Sidebar>
//   );
// }

"use client";

import * as React from "react";
import {
  ShieldCheck,
  Trophy,
  User,
  Brain,
  LayoutDashboard,
  FilePlus,
  LayoutTemplate,
  GraduationCap,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { NavMain } from "./NavMain";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Create Exam",
    url: "/admin/create-exam",
    icon: FilePlus,
    badge: "New",
  },
  { title: "Exams", url: "/admin/exam", icon: Brain, badge: null },
  { title: "Results", url: "/admin/results", icon: Trophy, badge: null },
  {
    title: "Section Templates",
    url: "/admin/sections",
    icon: LayoutTemplate,
    badge: null,
  },
  { title: "SEB Config", url: "/admin/seb", icon: ShieldCheck, badge: "Beta" },
  { title: "Academic", url: "/admin/academic", icon: Building2, badge: null },
  {
    title: "Manage Admins",
    url: "/admin/manage-admins",
    icon: User,
    badge: null,
  },
];

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
      <GraduationCap className="w-4 h-4 text-primary" />
    </div>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/40">
        {/*
          Plain div instead of SidebarMenuButton — gives full control over
          centering without fighting the button's built-in padding/flex.
        */}
        <div
          className={cn(
            "flex items-center rounded-xl px-3 py-1.5",
            "transition-colors duration-150",
            "hover:bg-sidebar-accent",
            collapsed ? "justify-center px-0" : "gap-3",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              /* ── Collapsed: icon only, perfectly centred ── */
              <motion.div
                key="icon-only"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.13, ease: "easeOut" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="flex items-center justify-center"
              >
                <LogoMark />
              </motion.div>
            ) : (
              /* ── Expanded: icon + wordmark side by side ── */
              <motion.div
                key="icon-and-wordmark"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex justify-center items-center gap-3 w-full"
              >
                <div className="flex items-center justify-center dark:bg-white/90 rounded-lg px-1.5 py-0.5 shrink-0">
                  <Image
                    src="/logo.webp"
                    alt="ExamPortal"
                    width={130}
                    height={30}
                    className="block h-7 w-auto object-contain"
                    priority
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-1.5">
        <NavMain items={NAV_ITEMS} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
