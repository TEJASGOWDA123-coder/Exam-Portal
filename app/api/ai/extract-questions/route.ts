import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { text, count, sections, difficulty } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "No text provided" },
                { status: 400 }
            );
        }

        // Double the requested count for the pool
        const targetCount = (count || 5) * 2;

        const prompt = `You are a RAG (Retrieval-Augmented Generation) agent specializing in educational assessment.
Your task is to analyze the provided text extracted from a document and frame high-quality multiple-choice questions based on its content.

Content to analyze:
"""
${text}
"""

Target Sections: ${sections ? sections.join(", ") : "General"}
Difficulty Level: ${difficulty || "Medium"}

Instructions:
1. Thoroughly understand the concepts, facts, and logic in the provided text.
2. Frame exactly ${targetCount} high-quality questions at a ${difficulty || "Medium"} difficulty level.
3. CRITICAL: You MUST assign each question to one of the following Target Sections: ${sections ? sections.join(", ") : "General"}.
4. Carefully analyze the content of each question and map it to the most relevant section from the list above. 
5. If the Target Sections are specific topics (e.g., "History", "Science"), ensure the question content strictly matches the section.
6. Ensure that for every question, one and only one option is unmistakably correct based on the text.
7. Distractors (incorrect options) should be plausible but clearly wrong.
8. If the text contains specific data, dates, or technical terms, use them accurately.

For each question, provide:
- A clear, concise question
- Four distinct options labeled A, B, C, D
- The correct answer (A, B, C, or D)
- The section name this question belongs to (MUST be EXACTLY one from: ${sections ? sections.join(", ") : "General"}).

Format your response as a JSON array with this exact structure:
[
  {
    "question": "question text here",
    "optionA": "choice 1",
    "optionB": "choice 2",
    "optionC": "choice 3",
    "optionD": "choice 4",
    "correctAnswer": "A",
    "section": "section name"
  }
]

IMPORTANT: Return ONLY the JSON array. Do not include introductory text, explanations, or markdown code blocks other than the JSON itself. If no clear questions can be framed, return an empty array [].`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert exam question extractor. You convert raw text into structured JSON multiple-choice questions and categorize them into sections.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 8192,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content generated");
        }

        let jsonContent = content.trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonContent = jsonMatch[0];
        }

        const questions = JSON.parse(jsonContent);

        if (!Array.isArray(questions)) {
            throw new Error("Invalid response format from AI");
        }

        return NextResponse.json({ questions });
    } catch (error: any) {
        console.error("AI extraction error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to extract questions" },
            { status: 500 }
        );
    }
}
