import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sebConfigs } from "@/lib/db/seb_schema";
import { eq } from "drizzle-orm";

// GET all configs
export async function GET() {
  try {
    const configs = await db.select().from(sebConfigs);
    return NextResponse.json(configs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new config or upload
export async function POST(req: Request) {
  try {
    const { name, configData } = await req.json();

    if (!name || !configData) {
      return NextResponse.json({ error: "Missing name or configData" }, { status: 400 });
    }

    const newConfig = {
      id: crypto.randomUUID(),
      name,
      configData,
      isActive: false,
      createdAt: new Date(),
    };

    await db.insert(sebConfigs).values(newConfig);

    return NextResponse.json(newConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH toggle active
export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Set all to inactive first if we want only one active at a time (simulation)
    if (isActive) {
       await db.update(sebConfigs).set({ isActive: false });
    }

    await db.update(sebConfigs)
      .set({ isActive })
      .where(eq(sebConfigs.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE config
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await db.delete(sebConfigs).where(eq(sebConfigs.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
