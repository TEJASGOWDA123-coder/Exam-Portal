import "dotenv/config";
import { db } from "../lib/db";
import { sections } from "../lib/db/schema";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("Seeding Dynamic Section Identity Engine...");

  const defaultSections = [
    {
      id: uuidv4(),
      name: "Verbal",
      description: "Focus on Reading Comprehension (RC), Synonyms, and Grammar.",
      identityPrompt: "You are a Verbal Identity Engine. Focus on Reading Comprehension (RC), Synonyms, and Grammar. For RC, always include a passage at the start of the question field.",
      transformationPrompt: "If the topic is literary, generate a passage. If the topic is factual, generate a descriptive context.",
      validationRules: JSON.stringify({
        minWordCount: 50,
        requiresPassage: true
      }),
      outputSchema: JSON.stringify({
        question: "string (with passage prepended)",
        optionA: "string",
        optionB: "string",
        optionC: "string",
        optionD: "string",
        correctAnswer: "A|B|C|D"
      }),
      isActive: true
    },
    {
      id: uuidv4(),
      name: "Quants",
      description: "Focus on numeric data, statistics, and calculations.",
      identityPrompt: "You are a Quantitative Identity Engine. Focus on numeric data, statistics, and calculations. Every question must include digits and require a mathematical operation.",
      transformationPrompt: "Convert the topic into a word problem that requires calculation or statistical analysis.",
      validationRules: JSON.stringify({
        mustContainDigits: true
      }),
      outputSchema: JSON.stringify({
        question: "string (numeric word problem)",
        optionA: "string",
        optionB: "string",
        optionC: "string",
        optionD: "string",
        correctAnswer: "A|B|C|D"
      }),
      isActive: true
    },
    {
      id: uuidv4(),
      name: "Logical",
      description: "Focus on reasoning patterns, sequence, and entity relationships.",
      identityPrompt: "You are a Logical Reasoning Identity Engine. Focus on reasoning patterns, sequence, and entity relationships. Avoid direct arithmetic.",
      transformationPrompt: "Transform the topic into a sequential logic puzzle or an entity relationship scenario.",
      validationRules: JSON.stringify({
        mustContainReasoning: true
      }),
      outputSchema: JSON.stringify({
        question: "string (puzzle or pattern)",
        optionA: "string",
        optionB: "string",
        optionC: "string",
        optionD: "string",
        correctAnswer: "A|B|C|D"
      }),
      isActive: true
    }
  ];

  for (const section of defaultSections) {
    try {
      await db.insert(sections).values(section).onConflictDoNothing();
      console.log(`Seeded section: ${section.name}`);
    } catch (err) {
      console.error(`Failed to seed ${section.name}:`, err);
    }
  }

  console.log("Seeding complete!");
}

seed();
