import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTextEmbedding } from '@/lib/ai/embeddings';
import { CreateProductSchema } from '@/lib/utils/validators';
import { formatErrorResponse } from '@/lib/utils/errors';
import type { ApiResponse, Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


// Retry helper
async function retryQuery<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (i > 0) await prisma.$connect();
      return await fn();
    } catch (error: any) {
      const isLastAttempt = i === maxRetries - 1;
      const isConnectionError = error?.code === 'P1017' || error?.message?.includes('closed');
      if (isConnectionError && !isLastAttempt) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateProductSchema.parse(body);

    let embedding: number[] | null = null;
    try {
      const textForEmbedding = [
        validatedData.title,
        validatedData.description,
        ...validatedData.tags,
      ].join(' ');
      
      embedding = await generateTextEmbedding(textForEmbedding);
    } catch (error) {
      console.warn('⚠️ Embedding generation failed');
    }

    const productId = await retryQuery(async () => {
      return await prisma.$queryRaw<Array<{ id: string }>>`
        INSERT INTO products (id, title, description, price, size, category, tags, embedding, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid()::text,
          ${validatedData.title},
          ${validatedData.description},
          ${validatedData.price},
          ${validatedData.size || null},
          ${validatedData.category},
          ${validatedData.tags}::text[],
          ${embedding ? `[${embedding.join(',')}]` : null}::vector(768),
          NOW(),
          NOW()
        )
        RETURNING id
      `;
    });

    const product = await retryQuery(async () => {
      return await prisma.product.findUnique({
        where: { id: productId[0].id },
        include: { images: true },
      });
    });

    return NextResponse.json({
      success: true,
      data: product,
      metadata: { timestamp: new Date().toISOString() },
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Product creation error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const products = await retryQuery(() => 
      prisma.product.findMany({
        take: limit,
        skip: offset,
        include: { images: true },
        orderBy: { createdAt: 'desc' },
      })
    );

    const total = await retryQuery<number>(() => 
      prisma.product.count()
    );

    return NextResponse.json({
      success: true,
      data: products as Product[],
      metadata: {
        timestamp: new Date().toISOString(),
        pagination: { 
          limit, 
          offset, 
          total, 
          hasMore: offset + limit < total 
        },
      },
    });

  } catch (error) {
    console.error('❌ Get products error:', error);
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
