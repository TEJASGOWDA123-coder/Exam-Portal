import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, secret } = body;

        // Basic security check - compare with AUTH_SECRET
        if (secret !== process.env.AUTH_SECRET) {
            return NextResponse.json({ error: "Unauthorized: Invalid secret" }, { status: 401 });
        }

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            id: `admin-${Date.now()}`,
            name,
            email,
            password: hashedPassword,
            role: "admin",
        });

        return NextResponse.json({ success: true, message: "Admin registered successfully" });
    } catch (error) {
        console.error("Admin registration failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
