import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
    try {
        const { sectionName } = await req.json();
        if (!sectionName) {
            return NextResponse.json({ error: "Section name is required" }, { status: 400 });
        }

        const prompt = `
        You are a specialized Exam Architecture AI. 
        Based on the section name provided, generate a complete JSON configuration for this exam section.

        Section Name: "${sectionName}"

        Return a JSON object with EXACTLY these fields:
        1. "description": A short, clear description of what this section focuses on (for human admins and RAG classification).
        2. "identityPrompt": A detailed system prompt defining the AI PERSONA for this section (e.g., "You are an expert in...").
        3. "transformationPrompt": Specific logic on how topics should be transformed into questions for this section (e.g., "Present the scenario as a logical puzzle...").
        4. "validationRules": A JSON object containing rules the generation must follow (e.g., {"mustContainDigits": true, "difficulty": "complex"}).

        Return ONLY the JSON object. No markdown, no pre-text, no post-text.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only API that generates exam section configurations.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2048,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("No content generated");

        let jsonString = content.trim();
        // Remove markdown code blocks if present
        if (jsonString.startsWith("```json")) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith("```")) {
            jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        }

        const config = JSON.parse(jsonString);
        return NextResponse.json(config);
    } catch (error: any) {
        console.error("Autofill Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
