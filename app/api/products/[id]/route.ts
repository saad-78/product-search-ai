import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ApiResponse, Product } from '@/types';

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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await retryQuery(async () => {
      return await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    const response: ApiResponse<Product> = {
      success: true,
      data: product as Product,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Get product error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await retryQuery(async () => {
      return await prisma.product.findUnique({
        where: { id },
      });
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    await retryQuery(async () => {
      return await prisma.product.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      data: null,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete product',
        },
      },
      { status: 500 }
    );
  }
}
