import Groq from 'groq-sdk';
import type { SearchFilters } from '@/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function parseSearchQueryWithGroq(query: string): Promise<SearchFilters> {
  try {
    console.log('🚀 Calling Groq to parse query...');
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a product search query parser. Return ONLY valid JSON, no markdown, no explanation.',
        },
        {
          role: 'user',
          content: `Parse this product search query into structured filters:

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
- "red shirt size L" → {"size": "L", "keywords": ["red", "shirt"]}`,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Fast & free
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }, // Ensures JSON response
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';
    console.log('📝 Groq response:', responseText);

    const parsed = JSON.parse(responseText);
    console.log('✅ Groq parsed successfully');

    return {
      priceMin: parsed.priceMin || null,
      priceMax: parsed.priceMax || null,
      size: parsed.size || null,
      category: parsed.category || null,
      keywords: parsed.keywords || [],
    };
  } catch (error: any) {
    console.error('❌ Groq error:', error?.message);
    throw error;
  }
}
