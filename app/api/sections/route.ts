import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const allSections = await db.select().from(sections).where(eq(sections.isActive, true));
        return NextResponse.json(allSections);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, identityPrompt, transformationPrompt, validationRules, description } = body;

        const newSection = {
            id: uuidv4(),
            name,
            description,
            identityPrompt,
            transformationPrompt,
            validationRules: JSON.stringify(validationRules || {}),
            isActive: true,
            createdAt: new Date(),
        };

        await db.insert(sections).values(newSection);
        return NextResponse.json(newSection);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.update(sections).set({ isActive: false }).where(eq(sections.id, id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, name, description, identityPrompt, transformationPrompt, validationRules, isActive } = body;
        
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (identityPrompt !== undefined) updates.identityPrompt = identityPrompt;
        if (transformationPrompt !== undefined) updates.transformationPrompt = transformationPrompt;
        if (validationRules !== undefined) {
            updates.validationRules = typeof validationRules === 'string' 
                ? validationRules 
                : JSON.stringify(validationRules);
        }
        if (isActive !== undefined) updates.isActive = isActive;

        await db.update(sections).set(updates).where(eq(sections.id, id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("PATCH Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
