import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  uploadToCloudinary, 
  deleteFromCloudinary,
  isValidImageType, 
  isValidFileSize 
} from '@/lib/storage/cloudinary';
import { formatErrorResponse, NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { ApiResponse, Image } from '@/types';

/**
 * POST /api/products/:id/images
 * Upload product image to Cloudinary
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL FIX: Await params in Next.js 15
    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      throw new ValidationError('No image file provided', 'image');
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      throw new ValidationError(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
        'image'
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      throw new ValidationError(
        'File size exceeds 10MB limit',
        'image'
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const { secureUrl, publicId } = await uploadToCloudinary(buffer, file.name);

    // Save to database
    const image = await prisma.image.create({
      data: {
        productId: id,
        url: secureUrl, // HTTPS URL
        storageKey: publicId, // Cloudinary public_id
        filename: file.name,
        size: file.size,
      },
    });

    const response: ApiResponse<Image> = {
      success: true,
      data: image as Image,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Image upload error:', error);
    const errorResponse = formatErrorResponse(error);
    const statusCode = error instanceof NotFoundError ? 404 : 400;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * GET /api/products/:id/images
 * List all images for a product
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CRITICAL FIX: Await params
    const { id } = await params;

    const images = await prisma.image.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse<Image[]> = {
      success: true,
      data: images as Image[],
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
