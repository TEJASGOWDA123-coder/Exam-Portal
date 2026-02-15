import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { question, correctAnswer, studentJustification } = await req.json();

        if (!studentJustification) {
            return NextResponse.json({ 
                score: 0, 
                feedback: "No justification provided.", 
                isValid: false 
            });
        }

        const prompt = `
            You are an expert scientific academic examiner. Your task is to validate a student's reasoning (justification) for their answer to a specific question.
            
            [QUESTION]
            ${question}
            
            [CORRECT ANSWER/KEY]
            ${correctAnswer}
            
            [STUDENT'S JUSTIFICATION]
            ${studentJustification}
            
            [INSTRUCTIONS]
            1. Analyze if the student's reasoning is conceptually sound and directly justifies why the correct answer is indeed correct.
            2. If the justification is logically sound even if phrased differently than the key, give a high score.
            3. If the justification is "I think so" or "Just guessed", give a score of 0.
            4. Provide a score from 0 to 10.
            5. Provide a very concise one-sentence feedback.
            
            Return ONLY a JSON object:
            {
                "score": number, 
                "feedback": "string",
                "isValid": boolean (true if score >= 5)
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a specialized justification validation agent.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("AI failed to respond");

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Justification validation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
