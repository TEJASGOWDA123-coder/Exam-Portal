"use client";

import * as React from "react";
import {
  BookOpen,
  MessageCircle,
  ShieldCheck,
  Code,
  Trophy,
  FolderOpen,
  Settings,
  User,
  SquareTerminal,
  Brain,
  Binoculars,
  FileCode,
  Sparkle,
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  GraduationCap,
  LayoutTemplate,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
// import { NavMain } from "./NavMain";
import { motion } from "framer-motion";

import Image from "next/image";
import { NavMain } from "./NavMain";
// import Subscribepart from "./Subscribepart";

// Sidebar navigation data
const data = {
  navMain: [
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
    {
      title: "Exam",
      url: "/admin/exam",
      icon: Brain,
      badge: null,
    },
    {
      title: "Results",
      url: "/admin/results",
      icon: Trophy,
      badge: null,
    },
    {
      title: "Section Templates",
      url: "/admin/sections",
      icon: LayoutTemplate,
      badge: null,
    },
    {
      title: "SEB Config",
      url: "/admin/seb",
      icon: ShieldCheck,
      badge: "Beta",
    },
    {
      title: "Manage Admins",
      url: "/admin/manage-admins",
      icon: User,
      badge: null,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className={`
            group flex items-center gap-3 rounded-xl px-3 py-2
            transition-all duration-200 ease-in-out
            hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
            ${state === "collapsed" ? "justify-center px-0" : ""}
          `}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          // className="flex h-11 w-11 items-center justify-center rounded-xl
          //            bg-gradient-to-r from-blue-600 to-purple-600 shadow-md"
          >
            {/* <Brain className="h-6 w-6 text-white" /> */}
            {/* <Image
              src="/logoipsum.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            /> */}
          </motion.div>
          {state !== "collapsed" && (
            <div className="flex items-center gap-2 text-left">
              <div className="bg-transparent dark:bg-white flex items-center justify-center w-fit h-fit rounded-lg">
                <Image src="/logo.webp" alt="Logo" width={200} height={200} />
              </div>
              <div className="flex flex-col text-left">
                <span className="truncate text-sm font-medium">
                  ExamPortal
                </span>
              </div>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail ref={buttonRef} />
    </Sidebar>
  );
}
