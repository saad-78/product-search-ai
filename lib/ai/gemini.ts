import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SearchFilters } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function parseSearchQuery(query: string): Promise<SearchFilters> {
  // Try newest model first, fallback to older one
  const models = ['gemini-1.5-flash', 'gemini-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`🤖 Trying ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Parse this product search query into structured filters. Return ONLY a JSON object, no markdown, no explanation.

Query: "${query}"

Return format:
{
  "priceMin": number or null,
  "priceMax": number or null,
  "size": string or null (e.g., "M", "L", "42"),
  "category": string or null (Clothing, Footwear, Electronics, Accessories, Home, Sports, Other),
  "keywords": string[] (extract main search terms)
}

Examples:
- "jacket under 3000" → {"priceMax": 3000, "keywords": ["jacket"]}
- "red shirt size L" → {"size": "L", "keywords": ["red", "shirt"]}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Success with ${modelName}`);

      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);

      return {
        priceMin: parsed.priceMin || null,
        priceMax: parsed.priceMax || null,
        size: parsed.size || null,
        category: parsed.category || null,
        keywords: parsed.keywords || [],
      };
    } catch (error: any) {
      console.warn(`⚠️ ${modelName} failed:`, error?.message);
      
      // If last model, throw error
      if (modelName === models[models.length - 1]) {
        throw error;
      }
      // Otherwise continue to next model
    }
  }

  throw new Error('All models failed');
}
