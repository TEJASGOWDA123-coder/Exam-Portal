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
        You are a strict JSON generator for an AI-powered exam system.
        Your job is to generate a COMPLETE and STRUCTURED exam section configuration based on the section name.

        Section Name: "${sectionName}"

        Return ONLY valid JSON. No explanations. No markdown.

        The JSON must follow EXACTLY this structure:
        {
          "description": string,
          "identityPrompt": string,
          "transformationPrompt": string,
          "validationRules": {
            "minQuestions": number,
            "maxQuestions": number,
            "questionTypeDistribution": {
              "mcq": number,
              "msq": number,
              "passage": number,
              "fill_blank": number
            },
            "constraints": {
              "maxPassageWords": number,
              "passageQuestions": number,
              "allowLongContext": boolean,
              "cognitiveLevels": string[]
            }
          }
        }

        PEDAGOGICAL STRATEGY (STRICT RULES for Identity & Transformation):

        1. IDENTITY PROMPT (The "Who"):
        - Define the AI as a Subject Matter Expert (e.g., "Senior Examiner in Mathematics" or "Technical Architect").
        - MUST include an internal validation step: "Before outputting, verify if the question tests application not just memory."
        - If the section is "Aptitude" or "Logical Reasoning", define the persona as a Psychometrician focusing on pattern recognition and deductive logic.

        2. TRANSFORMATION PROMPT (The "How"):
        - Implement Bloom's Taxonomy: Prioritize 'Apply', 'Analyze', and 'Evaluate' levels.
        - AVOID: Simple definitions like "What is...?" or "Define...".
        - REQUIRE: Scenario-based questions, case studies, or multi-step reasoning.
        - APTITUDE RULES: For aptitude, instructions must focus on quantitative relations, spatial reasoning, or linguistic patterns.
        - LOGIC: Questions must contain distractions (incorrect but plausible paths).
        - FORMATS: Explicitly define how to generate MCQ, MSQ, Passages, and Fill-in-the-blanks WITHOUT mixing them randomly.

        3. VALIDATION RULES:
        - minQuestions: 10, maxQuestions: 20
        - Distribution must sum to minQuestions.
        - Include "cognitiveLevels" like ["Application", "Analysis"] in the constraints.
        - maxPassageWords: 80–120.
        - allowLongContext: true only if passages exist.

        4. DO NOT:
        - add extra fields or rename them.
        - return text outside the JSON.
        - use definitions for more than 10% of the questions.

        Return ONLY JSON.
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
