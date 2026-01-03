'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { Loader2, AlertCircle } from 'lucide-react';
import type { SearchResult } from '@/types';

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string>('');

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 12 }),
        });

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('API returned non-JSON response. Search endpoint may not exist.');
        }

        // Get response text first
        const text = await response.text();
        if (!text) {
          throw new Error('API returned empty response');
        }

        const data = JSON.parse(text);

        if (!data.success) {
          throw new Error(data.error?.message || 'Search failed');
        }

        setResults(data.data || []);
        setSearchType(data.metadata?.searchMetadata?.searchType || 'hybrid');
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Enter a search query</h2>
        <p className="text-gray-600 mb-8">Try searching for products like "jacket" or "headphones"</p>
        <SearchBar />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">
            Results for "{query}"
          </h1>
          {searchType === 'keyword_fallback' && (
            <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
              Keyword Search (AI unavailable)
            </span>
          )}
        </div>
        <SearchBar />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Searching with AI...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">Check browser console for details</p>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No products found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-6">
            Found {results.length} product{results.length !== 1 ? 's' : ''}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                similarity={product.similarity}
                score={product.score}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
