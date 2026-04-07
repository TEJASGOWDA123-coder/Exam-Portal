import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { academicYears } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    let query: any = {
      orderBy: (academicYears: any, { asc }: any) => [asc(academicYears.name)],
    };

    if (departmentId) {
      query.where = eq(academicYears.departmentId, departmentId);
    }

    const years = await db.query.academicYears.findMany(query);
    return NextResponse.json(years);
  } catch (error) {
    console.error("Failed to fetch academic years:", error);
    return NextResponse.json({ error: "Failed to fetch academic years" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, departmentId } = body;

    if (!name || !departmentId) {
      return NextResponse.json({ error: "Name and Department ID are required" }, { status: 400 });
    }

    const newYear = {
      id: `year-${Date.now()}`,
      name: name.trim(),
      departmentId,
    };

    await db.insert(academicYears).values(newYear);
    return NextResponse.json(newYear);
  } catch (error: any) {
    console.error("Failed to create academic year:", error);
    if (error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Year already exists in this department" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create academic year" }, { status: 500 });
  }
}
