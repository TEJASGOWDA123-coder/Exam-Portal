import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, usn, class: className, year, section, examId } = body;

        if (!name || !email || !usn || !className || !year || !section || !examId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const studentData = {
            id: `s-${examId}-${usn.trim().toUpperCase()}`,
            examId,
            name: name.trim(),
            email: email.trim(),
            usn: usn.trim().toUpperCase(),
            class: className.trim(),
            year: year.trim(),
            section: section.trim(),
        };

        // Persist to DB using ID as conflict target (derived from examId + USN)
        await db.insert(students).values(studentData).onConflictDoUpdate({
            target: students.id,
            set: {
                name: studentData.name,
                email: studentData.email,
                class: studentData.class,
                year: studentData.year,
                section: studentData.section
            }
        });

        return NextResponse.json({ success: true, student: studentData });
    } catch (error) {
        console.error("Failed to persist student:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
