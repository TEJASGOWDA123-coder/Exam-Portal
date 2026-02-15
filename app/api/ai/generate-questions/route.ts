import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { sections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Validation Engine: Interprets dynamic JSON rules
 */
function validateQuestion(question: any, rules: any): { valid: boolean; reason?: string } {
    if (!rules) return { valid: true };
    
    if (rules.mustContainDigits && !/\d/.test(question.question)) {
        return { valid: false, reason: "Question must contain digits for this section." };
    }
    
    if (rules.minWordCount) {
        const words = question.question.trim().split(/\s+/).length;
        if (words < rules.minWordCount) {
            return { valid: false, reason: `Question must be at least ${rules.minWordCount} words.` };
        }
    }

    if (rules.mustContainKeywords) {
        const lowerQ = question.question.toLowerCase();
        const missing = rules.mustContainKeywords.filter((kw: string) => !lowerQ.includes(kw.toLowerCase()));
        if (missing.length > 0) {
            return { valid: false, reason: `Missing required keywords: ${missing.join(", ")}` };
        }
    }

    return { valid: true };
}

export async function POST(req: Request) {
    try {
        const { topic, count, difficulty, sectionId } = await req.json();

        if (!topic || !count) {
            return NextResponse.json(
                { error: "Topic and count are required" },
                { status: 400 }
            );
        }

        // Fetch Section Identities
        let sectionConfig = null;
        let activeSections: any[] = [];
        
        if (sectionId && sectionId !== "AUTO") {
            const results = await db.select().from(sections).where(eq(sections.id, sectionId));
            sectionConfig = results[0];
        } else {
            activeSections = await db.select().from(sections).where(eq(sections.isActive, true));
        }

        const identity = sectionConfig?.identityPrompt || "You are a Section-Aware Assessment Engine.";
        const transformation = sectionConfig?.transformationPrompt || "Frame high-quality questions based on the topic.";
        const validationRules = sectionConfig?.validationRules ? JSON.parse(sectionConfig.validationRules) : null;

        const sectionContext = activeSections.length > 0 
            ? `Available Sections for Classification:\n${activeSections.map(s => `- ${s.id}: ${s.name} (${s.description})`).join("\n")}`
            : "";

        const prompt = `
Generate ${count} multiple choice questions about "${topic}".
Difficulty: ${difficulty || "medium"}

Identity: ${identity}
Transformation Rule: ${transformation}
${sectionContext}

Instructions:
1. Return a JSON object with a "questions" key containing exactly ${count} question objects.
2. If context/passages are needed (Reading Comprehension):
   - You MUST generate multiple questions for each passage.
   - For example, if ${count} is 5, generate 1 passage and 5 distinct questions about it.
   - You can provide the passage as a "passage" key in the root object OR prepend it to each question.
3. Every question object must be separate. NEVER group multiple questions into one object.
4. Each object must have: question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D), solution, and sectionId (if Smart Categorizing).
5. Strict Schema: { "passage": "...", "questions": [{...}, {...}] }
${validationRules ? `6. Validation Rules: ${JSON.stringify(validationRules)}` : ""}
7. IMPORTANT: Total question objects in the final array MUST be exactly ${count}.
`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only assessment engine. You always return a JSON object containing a 'questions' array. Never include any other text.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 8000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("No content generated");

        // Advanced Parsing Logic
        let jsonContent = content.trim();
        jsonContent = jsonContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        
        // Clean non-printable control characters
        jsonContent = jsonContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
            if (c === "\n" || c === "\r" || c === "\t") return c;
            return "";
        });

        const findArrayRecursively = (obj: any): any[] | null => {
            if (Array.isArray(obj)) return obj;
            if (typeof obj !== "object" || obj === null) return null;
            
            const priorityKeys = ["questions", "data", "items", "mcqs", "results"];
            for (const key of priorityKeys) {
                if (Array.isArray(obj[key])) return obj[key];
            }

            for (const val of Object.values(obj)) {
                if (Array.isArray(val)) return val;
                if (typeof val === "object") {
                    const found = findArrayRecursively(val);
                    if (found) return found;
                }
            }
            return null;
        };

        const repairAndParse = (str: string) => {
            try {
                return JSON.parse(str);
            } catch (e) {
                // Try brute force extraction if parsing the whole thing fails
                const startIdx = str.indexOf("[");
                const endIdx = str.lastIndexOf("]");
                if (startIdx !== -1 && endIdx !== -1) {
                    try {
                        return JSON.parse(str.substring(startIdx, endIdx + 1));
                    } catch {}
                }
                
                // If it looks truncated (ends mid-sentence/mid-word), try to close brackets
                let repaired = str.trim();
                const openers = (repaired.match(/[\[\{]/g) || []).length;
                const closers = (repaired.match(/[\]\}]/g) || []).length;
                
                if (openers > closers) {
                    for (let i = 0; i < (openers - closers); i++) {
                        repaired += '"}'; // Guessing closure
                    }
                    try { return JSON.parse(repaired); } catch {}
                }
                throw e;
            }
        };

        let generatedQuestions;
        let sharedPassage = "";
        
        try {
            const parsed = repairAndParse(jsonContent);
            
            // Try to find a global passage/context in the root object
            if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
                sharedPassage = parsed.passage || parsed.context || parsed.reading_material || parsed.material || "";
            }

            generatedQuestions = findArrayRecursively(parsed);
        } catch (err: any) {
            console.error("Critical Parse Error:", err.message);
            console.error("Raw Content Sample:", jsonContent.substring(0, 200));
            throw new Error("AI output was malformed. Try reducing the question count or using a simpler topic.");
        }

        if (!Array.isArray(generatedQuestions)) {
            throw new Error("Could not find a valid question array in the AI response.");
        }

        // Mapping and Validation
        const validatedQuestions = generatedQuestions.map((q: any) => {
            let sectionName = sectionConfig?.name || "General";
            if (q.sectionId) {
                const found = activeSections.find(s => s.id === q.sectionId);
                if (found) sectionName = found.name;
            }

            // Combine shared passage with the specific question if available
            let finalQuestion = (q.question || "").trim();
            if (sharedPassage) {
                const passageInQuestion = finalQuestion.includes(sharedPassage.substring(0, 50)); // Check first 50 chars for match
                if (!passageInQuestion) {
                    finalQuestion = `[CONTEXT/PASSAGE]\n${sharedPassage.trim()}\n\n[QUESTION]\n${finalQuestion}`;
                }
            }

            return {
                ...q,
                question: finalQuestion,
                correctAnswer: (q.correctAnswer || "A").toString().toUpperCase(),
                section: sectionName
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
