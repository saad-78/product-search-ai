import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTextEmbedding } from '@/lib/ai/embeddings';
import { UpdateProductSchema } from '@/lib/utils/validators';
import { formatErrorResponse, NotFoundError } from '@/lib/utils/errors';
import { deleteFromCloudinary } from '@/lib/storage/cloudinary';
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

/**
 * GET /api/products/:id
 * Get single product by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('📥 GET /api/products/' + id);

    const product = await retryQuery(async () => {
      return await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
    });

    if (!product) {
      console.log('❌ Product not found:', id);
      throw new NotFoundError('Product');
    }

    console.log('✅ Product found:', product.title);

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
    const errorResponse = formatErrorResponse(error);
    const statusCode = error instanceof NotFoundError ? 404 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * PUT /api/products/:id
 * Update product
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updates = UpdateProductSchema.parse(body);

    const existingProduct = await retryQuery(async () => {
      return await prisma.product.findUnique({ where: { id } });
    });

    if (!existingProduct) {
      throw new NotFoundError('Product');
    }

    // Regenerate embedding if text fields changed
    let embedding: number[] | undefined;
    if (updates.title || updates.description || updates.tags) {
      const textForEmbedding = [
        updates.title || existingProduct.title,
        updates.description || existingProduct.description,
        ...(updates.tags || existingProduct.tags),
      ].join(' ');

      try {
        embedding = await generateTextEmbedding(textForEmbedding);
      } catch (error) {
        console.warn('Failed to generate embedding on update');
      }
    }

    if (embedding) {
      await retryQuery(async () => {
        return await prisma.$executeRaw`
          UPDATE products 
          SET 
            title = COALESCE(${updates.title}, title),
            description = COALESCE(${updates.description}, description),
            price = COALESCE(${updates.price}, price),
            size = COALESCE(${updates.size}, size),
            category = COALESCE(${updates.category}, category),
            tags = COALESCE(${updates.tags ? updates.tags : null}::text[], tags),
            embedding = ${`[${embedding.join(',')}]`}::vector(768),
            "updatedAt" = NOW()
          WHERE id = ${id}
        `;
      });
    } else {
      await retryQuery(async () => {
        return await prisma.product.update({
          where: { id },
          data: updates,
        });
      });
    }

    const updatedProduct = await retryQuery(async () => {
      return await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct as Product,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    const statusCode = error instanceof NotFoundError ? 404 : 400;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * DELETE /api/products/:id
 * Delete product
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await retryQuery(async () => {
      return await prisma.product.findUnique({
        where: { id },
        include: { images: true },
      });
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      try {
        await deleteFromCloudinary(image.storageKey);
      } catch (error) {
        console.error(`Failed to delete image ${image.storageKey}:`, error);
      }
    }

    await retryQuery(async () => {
      return await prisma.product.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      metadata: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    const statusCode = error instanceof NotFoundError ? 404 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
