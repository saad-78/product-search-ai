'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Try: 'medium jacket under 3000' or 'red shirt'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="px-8">
          Search
        </Button>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Try:</span>
        {['jacket under 3000', 'red shirt size L', 'wireless headphones', 'leather shoes'].map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="text-sm text-blue-600 hover:underline"
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  );
}
