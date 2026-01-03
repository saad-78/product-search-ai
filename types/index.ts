/**
 * Shared TypeScript types
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  size?: string | null;
  category: string;
  tags: string[];
  embedding?: number[] | null;
  images: Image[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  productId: string;
  url: string;
  storageKey: string;
  filename: string;
  size: number;
  embedding?: number[] | null;
  createdAt: Date;
}

export interface SearchFilters {
  priceMin?: number | null;
  priceMax?: number | null;
  size?: string | null;
  category?: string | null;
  keywords: string[];
}

export interface SearchResult extends Product {
  similarity: number;
  score: number;
}

export interface SearchMetadata {
  query: string;
  filters?: SearchFilters;
  resultsCount: number;
  searchType: 'hybrid' | 'keyword_fallback';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    issues?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
    searchMetadata?: SearchMetadata;
  };
}
