'use client';

import Link from 'next/link';
import { Search, Package } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Package className="h-6 w-6" />
            <span>Product Search AI</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link 
              href="/admin" 
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
            <a
              href="https://github.com/saad-78/product-search-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
