import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Product } from '@/types';

async function getProduct(id: string): Promise<Product | null> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch product:', response.status);
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  console.log('Loading product:', id);
  
  const product = await getProduct(id);

  if (!product) {
    console.log('Product not found:', id);
    notFound();
  }

  const hasImages = product.images && product.images.length > 0;
  const mainImage = hasImages 
    ? product.images[0].url 
    : `https://placehold.co/800x800/e2e8f0/64748b?text=${encodeURIComponent(product.title.slice(0, 30))}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div>
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={!hasImages}
                />
              </div>
              {hasImages && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image) => (
                    <div key={image.id} className="relative h-20 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={image.url}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Badge>{product.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              
              <div className="text-4xl font-bold text-blue-600 mb-6">
                ₹{product.price.toLocaleString()}
              </div>

              {product.size && (
                <div className="mb-6">
                  <span className="text-sm text-gray-600">Size: </span>
                  <Badge variant="outline" className="ml-2">{product.size}</Badge>
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Product ID: {product.id}</p>
                <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
