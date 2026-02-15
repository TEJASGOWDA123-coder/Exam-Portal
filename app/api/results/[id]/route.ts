import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await db.delete(submissions).where(eq(submissions.id, id));
        return NextResponse.json({ success: true, message: "Result deleted. Student can now re-attempt." });
    } catch (error) {
        console.error("Failed to delete submission:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
