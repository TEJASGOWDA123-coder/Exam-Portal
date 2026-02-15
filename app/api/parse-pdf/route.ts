import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Save file temporarily using OS temp dir
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = join(os.tmpdir(), `pdf-${Date.now()}.pdf`);

        await writeFile(tempPath, buffer);

        // Load PDF using LangChain
        const loader = new PDFLoader(tempPath);
        const docs = await loader.load();

        // Extract text from all pages
        const text = docs.map(doc => doc.pageContent).join("\n");

        // Clean up temp file
        await unlink(tempPath);

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("PDF parsing error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to parse PDF" },
            { status: 500 }
        );
    }
}
