import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { topic, count, difficulty } = await req.json();

        if (!topic || !count) {
            return NextResponse.json(
                { error: "Topic and count are required" },
                { status: 400 }
            );
        }

        const prompt = `Generate ${count} multiple choice questions about "${topic}" with difficulty level: ${difficulty || "medium"}.

For each question, provide:
- A clear question
- Four options labeled A, B, C, D
- The correct answer (A, B, C, or D)

Format your response as a JSON array with this exact structure:
[
  {
    "question": "question text here",
    "optionA": "first option",
    "optionB": "second option",
    "optionC": "third option",
    "optionD": "fourth option",
    "correctAnswer": "A"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or explanation.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert exam question generator. You create clear, accurate, and educational multiple-choice questions. Always respond with valid JSON only.",
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
        if (!content) {
            throw new Error("No content generated");
        }

        // Extract JSON from the response (in case there's extra text)
        let jsonContent = content.trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonContent = jsonMatch[0];
        }

        const questions = JSON.parse(jsonContent);

        // Validate the structure
        if (!Array.isArray(questions)) {
            throw new Error("Invalid response format");
        }

        // Validate each question
        const validatedQuestions = questions.map((q, index) => {
            if (
                !q.question ||
                !q.optionA ||
                !q.optionB ||
                !q.optionC ||
                !q.optionD ||
                !q.correctAnswer
            ) {
                throw new Error(`Invalid question structure at index ${index}`);
            }

            // Ensure correctAnswer is uppercase A, B, C, or D
            const correctAnswer = q.correctAnswer.toUpperCase();
            if (!["A", "B", "C", "D"].includes(correctAnswer)) {
                throw new Error(`Invalid correct answer at index ${index}`);
            }

            return {
                question: q.question.trim(),
                optionA: q.optionA.trim(),
                optionB: q.optionB.trim(),
                optionC: q.optionC.trim(),
                optionD: q.optionD.trim(),
                correctAnswer,
            };
        });

        return NextResponse.json({ questions: validatedQuestions });
    } catch (error: any) {
        console.error("AI generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate questions" },
            { status: 500 }
        );
    }
}
