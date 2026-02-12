import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Protect admin routes
  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
      router.push("/admin");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Just return children - DashboardProvider handles the layout
  return <>{children}</>;
}
