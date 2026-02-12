import type { Metadata } from "next";
import "../globals.css";
import DashboardProvider from "@/components/pageComponents/DashboardProvider";

export const metadata: Metadata = {
  title: "Admin - ExamPortal",
  description: "Admin section for managing exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <Providers>{children}</Providers> */}
      <DashboardProvider>{children}</DashboardProvider>
    </>
  );
}
