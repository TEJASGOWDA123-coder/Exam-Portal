import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await db.select().from(students);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
