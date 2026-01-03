import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate text embedding using Gemini (FREE)
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    console.log('🔢 Generating embedding for text:', text.slice(0, 50) + '...');
    
    // FREE MODEL: text-embedding-004 (768 dimensions)
    const model = genAI.getGenerativeModel({ 
      model: 'text-embedding-004' 
    });
    
    const result = await model.embedContent(text);
    
    console.log('✅ Embedding generated, dimensions:', result.embedding.values.length);
    
    return result.embedding.values;
  } catch (error: any) {
    console.error('❌ Gemini embedding error:');
    console.error('Error message:', error?.message);
    
    throw error;
  }
}

/**
 * Generate query embedding (alias for text embedding)
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateTextEmbedding(query);
}
