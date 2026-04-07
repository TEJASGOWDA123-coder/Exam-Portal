import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { academicSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.delete(academicSections).where(eq(academicSections.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete academic section:", error);
    return NextResponse.json({ error: "Failed to delete academic section" }, { status: 500 });
  }
}
