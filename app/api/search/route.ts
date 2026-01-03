import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseSearchQueryWithGroq } from '@/lib/ai/groq'; // NEW: Use Groq
import { generateQueryEmbedding } from '@/lib/ai/embeddings'; // Keep Gemini
import { SearchQuerySchema } from '@/lib/utils/validators';
import { formatErrorResponse } from '@/lib/utils/errors';
import type { ApiResponse, SearchResult, SearchFilters, Image } from '@/types';

interface RawSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string | null;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  similarity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, limit } = SearchQuerySchema.parse(body);

    console.log(`🔍 Search query: "${query}"`);

    // Step 1: Parse query with Groq (FAST!)
    let filters: SearchFilters;
    try {
      filters = await parseSearchQueryWithGroq(query); // Using Groq now
      console.log('📊 Parsed filters:', filters);
    } catch (error) {
      console.warn('⚠️ Query parsing failed, using keyword search');
      return keywordOnlySearch(query, limit);
    }

    // Step 2: Generate query embedding with Gemini
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateQueryEmbedding(query);
    } catch (error) {
      console.warn('⚠️ Embedding generation failed, using keyword search');
      return keywordOnlySearch(query, limit);
    }

    // Step 3: Vector search with filters
    const results = await prisma.$queryRaw<RawSearchResult[]>`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.size,
        p.category,
        p.tags,
        p."createdAt",
        p."updatedAt",
        1 - (p.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector(768)) as similarity
      FROM products p
      WHERE 
        p.embedding IS NOT NULL
        AND (1 - (p.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector(768))) > 0.5
        AND (${filters.priceMax ? true : false} = false OR p.price <= ${filters.priceMax || 999999})
        AND (${filters.priceMin ? true : false} = false OR p.price >= ${filters.priceMin || 0})
        AND (${filters.size ? true : false} = false OR p.size = ${filters.size})
        AND (${filters.category ? true : false} = false OR p.category = ${filters.category})
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    // Fetch full images for each product
    const productsWithImages = await Promise.all(
      results.map(async (product: RawSearchResult) => {
        const images = await prisma.image.findMany({
          where: { productId: product.id },
        });
        return { ...product, images: images as Image[] };
      })
    );

    // Calculate hybrid scores
    const rankedResults: SearchResult[] = productsWithImages.map((product) => {
      const semanticScore = product.similarity;
      
      let priceScore = 0.5;
      if (filters.priceMax && product.price <= filters.priceMax) {
        priceScore = 1 - (product.price / filters.priceMax);
      }

      const keywordScore = filters.keywords.some((keyword: string) =>
        product.title.toLowerCase().includes(keyword.toLowerCase())
      ) ? 1 : 0;

      const finalScore = (semanticScore * 0.6) + (priceScore * 0.2) + (keywordScore * 0.2);

      return {
        ...product,
        score: finalScore,
        similarity: semanticScore,
      } as SearchResult;
    }).sort((a, b) => b.score - a.score);

    const response: ApiResponse<SearchResult[]> = {
      success: true,
      data: rankedResults,
      metadata: {
        timestamp: new Date().toISOString(),
        searchMetadata: {
          query,
          filters,
          resultsCount: rankedResults.length,
          searchType: 'hybrid',
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

async function keywordOnlySearch(query: string, limit: number) {
  try {
    const keywords = query.toLowerCase().split(' ');

    const results = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: keywords } },
        ],
      },
      include: {
        images: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const searchResults: SearchResult[] = results.map((p: any) => ({
      ...p,
      images: p.images as Image[],
      similarity: 0,
      score: 0,
    }));

    return NextResponse.json({
      success: true,
      data: searchResults,
      metadata: {
        timestamp: new Date().toISOString(),
        searchMetadata: {
          query,
          resultsCount: results.length,
          searchType: 'keyword_fallback' as const,
        },
      },
    });
  } catch (error) {
    console.error('Keyword search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: 'Search failed. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
