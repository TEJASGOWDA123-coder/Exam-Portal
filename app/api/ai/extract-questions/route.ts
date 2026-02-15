import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { sections } from "@/lib/db/schema";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { text, count, difficulty, mode = "extract", blueprint } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // Fetch All Available Sections for Dynamic Classification
        const activeSections = await db.select().from(sections);
        const sectionContext = activeSections.map(s => `
Section ID: ${s.id}
Name: ${s.name}
Description: ${s.description}
Identity: ${s.identityPrompt}
Transformation Rule: ${s.transformationPrompt}
Validation Rules: ${s.validationRules || "None"}
`).join("\n---\n");

        const isGenerate = mode === "generate";

        const prompt = `
You are a Section-Aware RAG Intelligence Agent. 
Your task is to analyze raw OCR text from an exam PDF and ${isGenerate ? "generate a MIXTURE of extracted and NEW" : "extract"} high-quality structured questions.

Raw Text:
"""
${text}
"""

Available Section Identities & Rules:
---
${sectionContext}

Instructions:
1. Structure Analyzer: Segment the text into individual questions or core concepts.
2. Section Classifier: Based on the content and the "Available Section Identities & Rules" above, assign each question to the most appropriate section_id.
3. Regeneration & Synthesis Engine: 
   ${isGenerate 
     ? `- Provide a MIXTURE of questions: Some directly extracted (but reworded) from the PDF, and some NEWLY synthesized based on the concepts in the PDF.
        - Ensure ALL questions are strictly relevant to the PDF's subject matter.
        - Do not return the original text word-for-word.`
     : `- Regenerate unique variations of the questions found in the PDF. Do not return the original text word-for-word.`
   }
4. Validation: Strictly adhere to the "Validation Rules" provided for each section (e.g., word count, keywords, format).
5. Difficulty: ${difficulty || "Medium"}
6. Target Architecture:
   ${blueprint 
     ? `You MUST generate EXACTLY the following number of questions for these specific sections:
        ${(blueprint as any[]).map(b => `- ${b.name}: ${b.pickCount} questions`).join("\n        ")}`
     : `Target Count: ${count || 10}`}

IMPORTANT: You MUST return exactly ${blueprint ? (blueprint as any[]).reduce((sum, b) => sum + (b.pickCount || 0), 0) : (count || 10)} questions in total. If the raw text doesn't contain enough questions, use your intelligence to generate more until you reach the total target, following the concepts in the provided text.

For each question, provide:
- question: The regenerated or synthesized question text.
- optionA, optionB, optionC, optionD: Four clear options.
- correctAnswer: A, B, C, or D.
- sectionId: The ID of the assigned section.
- solution: A brief explanation of the logic.

Format your response as a JSON array:
[
  {
    "question": "...",
    "optionA": "...",
    "optionB": "...",
    "optionC": "...",
    "optionD": "...",
    "correctAnswer": "A",
    "sectionId": "...",
    "solution": "..."
  }
]

IMPORTANT: Return ONLY the JSON array.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert at ${isGenerate ? "generating assessment questions based on source context" : "extracting and classifying exam questions from raw text"}. You always categorize questions based on the provided dynamic section identities and ${isGenerate ? "create a balanced mix of direct and synthesized questions" : "regenerate unique variants"}.`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: isGenerate ? 0.4 : 0.2,
            max_tokens: 8192,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("No content generated");

        let jsonContent = content.trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) jsonContent = jsonMatch[0];

        const extractedQuestions = JSON.parse(jsonContent);

        if (!Array.isArray(extractedQuestions)) throw new Error("Invalid response format");

        // Map back to display names for frontend compatibility if needed
        const result = extractedQuestions.map(q => {
            const section = activeSections.find(s => s.id === q.sectionId);
            return {
                ...q,
                section: section?.name || "General",
                source: "pdf"
            };
        });

        return NextResponse.json({ questions: result });
    } catch (error: any) {
        console.error("RAG extraction error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to extract questions" },
            { status: 500 }
        );
    }
}
