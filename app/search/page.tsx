import { Suspense } from 'react';
import { SearchResults } from './SearchResults';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-64 mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    </div>
  );
}
