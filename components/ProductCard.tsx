import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  similarity?: number;
  score?: number;
}

export function ProductCard({ product, similarity, score }: ProductCardProps) {
  const hasImage = product.images && product.images.length > 0;
  
  // Use placeholder service if no image
  const imageUrl = hasImage 
    ? product.images[0].url 
    : `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(product.title.slice(0, 20))}`;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="p-0">
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={!hasImage} // Don't optimize placeholder URLs
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
            {similarity && (
              <Badge variant="secondary" className="shrink-0">
                {(similarity * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              ₹{product.price.toLocaleString()}
            </span>
            {product.size && (
              <Badge variant="outline">Size: {product.size}</Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{product.category}</Badge>
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
