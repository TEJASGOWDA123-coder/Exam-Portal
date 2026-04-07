import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { academicDepartments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const depts = await db.query.academicDepartments.findMany({
      orderBy: (academicDepartments, { asc }) => [asc(academicDepartments.name)],
    });
    return NextResponse.json(depts);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
    }

    const newDept = {
      id: `dept-${Date.now()}-${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
    };

    await db.insert(academicDepartments).values(newDept);
    return NextResponse.json(newDept);
  } catch (error: any) {
    console.error("Failed to create department:", error);
    if (error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Department code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
