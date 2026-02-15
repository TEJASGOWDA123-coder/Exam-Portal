# AI/RAG Implementation Review

## Current Implementation Analysis

### ✅ What You're Doing Well

1. **Section-Aware Classification**: Your system dynamically fetches section configurations and injects them into prompts. This is a good approach for contextual generation.

2. **Dynamic Section Context**: The way you pass section identities, transformation rules, and validation rules to the LLM is well-structured.

3. **Validation Engine**: You have a good validation function that checks questions against dynamic rules.

4. **Error Handling**: Your JSON parsing with repair logic is robust.

### ⚠️ Current Implementation: "Prompt-Based RAG" (Not True RAG)

**What you're calling "RAG" is actually:**
- **Context Injection**: Passing section metadata in prompts
- **Prompt Engineering**: Using structured prompts with context
- **Not True RAG**: No vector embeddings, no similarity search, no retrieval from a knowledge base

**Current Flow:**
```
PDF Text → LLM Prompt (with section context) → Generated Questions
```

**True RAG Flow Should Be:**
```
Query → Vector Embedding → Similarity Search → Retrieve Relevant Context → LLM with Context → Answer
```

### 🔍 Issues Found

1. **Embedding Field Not Used**: 
   - You have `embedding: text("embedding")` in your schema
   - But embeddings are never generated or stored
   - No vector similarity search is implemented

2. **No Knowledge Base Retrieval**:
   - Questions are generated from scratch or from PDF text
   - No retrieval of similar questions from your database
   - No semantic search capability

3. **Missing Vector Database**:
   - You have `@upstash/vector` in package.json but it's not used
   - No vector database integration (Pinecone, Weaviate, Qdrant, etc.)

4. **No Embedding Generation**:
   - No code to generate embeddings from questions/text
   - No embedding model integration (OpenAI, Cohere, etc.)

## Recommendations for True RAG Implementation

### Option 1: Lightweight RAG (Recommended for Your Use Case)

**Use Case**: Retrieve similar questions from your database to avoid duplicates and maintain consistency.

```typescript
// lib/embeddings.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small", // or text-embedding-ada-002
    input: text,
  });
  return response.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

**Update Question Storage**:
```typescript
// When saving a question, generate and store embedding
const embedding = await generateEmbedding(question.question);
await db.insert(questions).values({
  ...questionData,
  embedding: JSON.stringify(embedding), // Store as JSON string
});
```

**Retrieve Similar Questions**:
```typescript
// app/api/ai/generate-questions/route.ts
async function findSimilarQuestions(query: string, examId: string, threshold = 0.7) {
  const queryEmbedding = await generateEmbedding(query);
  const allQuestions = await db.select().from(questions)
    .where(eq(questions.examId, examId));
  
  const similar = allQuestions
    .map(q => ({
      question: q,
      similarity: q.embedding 
        ? cosineSimilarity(queryEmbedding, JSON.parse(q.embedding))
        : 0
    }))
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5 similar questions
    
  return similar.map(item => item.question);
}
```

### Option 2: Full RAG with Vector Database (For Scale)

**Use Upstash Vector** (you already have it installed):

```typescript
// lib/vector-db.ts
import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function upsertQuestion(questionId: string, question: string, embedding: number[]) {
  await index.upsert({
    id: questionId,
    vector: embedding,
    metadata: { question, type: "question" },
  });
}

export async function searchSimilarQuestions(queryEmbedding: number[], topK = 5) {
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  return results;
}
```

### Option 3: Hybrid Approach (Best for Your Use Case)

**Combine your current approach with semantic search**:

1. **When generating questions**:
   - Generate embedding for the topic/query
   - Search for similar existing questions
   - Include similar questions in the prompt as examples
   - This helps maintain consistency and avoid duplicates

2. **When extracting from PDF**:
   - Generate embeddings for extracted questions
   - Check against existing question pool
   - Flag duplicates or very similar questions

**Implementation Example**:
```typescript
// app/api/ai/generate-questions/route.ts (enhanced)

export async function POST(req: Request) {
  const { topic, count, difficulty, sectionId } = await req.json();
  
  // NEW: Find similar questions
  const similarQuestions = await findSimilarQuestions(topic, examId);
  const similarContext = similarQuestions.length > 0
    ? `\n\nSimilar Existing Questions (for reference, avoid exact duplicates):\n${similarQuestions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}`
    : "";
  
  const prompt = `
Generate ${count} multiple choice questions about "${topic}".
${similarContext}
// ... rest of your prompt
`;
}
```

## What to Keep vs. Change

### ✅ Keep (These are Good):
- Section-aware classification system
- Dynamic section context injection
- Validation engine
- Your current prompt structure

### 🔄 Enhance:
- Add embedding generation when questions are created
- Add similarity search before generation
- Store embeddings in the database
- Use embeddings to find similar questions

### ❌ Don't Call It "RAG" Yet:
- It's more accurate to call it "Context-Aware AI Generation"
- True RAG requires: Embeddings + Vector Search + Retrieval + Generation

## Migration Path

1. **Phase 1**: Add embedding generation to new questions
2. **Phase 2**: Backfill embeddings for existing questions (optional)
3. **Phase 3**: Add similarity search to generation endpoints
4. **Phase 4**: Use retrieved similar questions as context in prompts

## Cost Considerations

- **OpenAI Embeddings**: ~$0.02 per 1M tokens (very cheap)
- **Groq**: Already using, no additional cost
- **Upstash Vector**: Free tier available, then pay-as-you-go

## Conclusion

Your current implementation is **good prompt engineering with context**, but it's **not true RAG**. To make it true RAG, you need to:

1. Generate embeddings for questions
2. Store embeddings in database or vector DB
3. Use similarity search to retrieve relevant context
4. Inject retrieved context into prompts

The hybrid approach (Option 3) would be the best fit for your exam portal use case - it maintains your current architecture while adding semantic search capabilities.
