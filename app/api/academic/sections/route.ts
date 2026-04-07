import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { academicSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yearId = searchParams.get("yearId");

    let query: any = {
      orderBy: (academicSections: any, { asc }: any) => [asc(academicSections.name)],
    };

    if (yearId) {
      query.where = eq(academicSections.yearId, yearId);
    }

    const sections = await db.query.academicSections.findMany(query);
    return NextResponse.json(sections);
  } catch (error) {
    console.error("Failed to fetch academic sections:", error);
    return NextResponse.json({ error: "Failed to fetch academic sections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, yearId } = body;

    if (!name || !yearId) {
      return NextResponse.json({ error: "Name and Year ID are required" }, { status: 400 });
    }

    const newSection = {
      id: `asec-${Date.now()}`,
      name: name.trim().toUpperCase(),
      yearId,
    };

    await db.insert(academicSections).values(newSection);
    return NextResponse.json(newSection);
  } catch (error: any) {
    console.error("Failed to create academic section:", error);
    if (error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Section already exists for this year" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create academic section" }, { status: 500 });
  }
}
