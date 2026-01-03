import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/storage/cloudinary';
import { formatErrorResponse, NotFoundError } from '@/lib/utils/errors';

/**
 * DELETE /api/products/:id/images/:imageId
 * Delete specific image
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    // CRITICAL FIX: Await params
    const { id, imageId } = await params;

    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== id) {
      throw new NotFoundError('Image');
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(image.storageKey);

    // Delete from database
    await prisma.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    const statusCode = error instanceof NotFoundError ? 404 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
