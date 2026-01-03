'use client';

import { SearchBar } from '@/components/SearchBar';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Centered Search Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          {/* Logo/Title */}
          <h1 className="text-5xl font-bold mb-2 text-gray-900">
            Product Search
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            AI-powered semantic search
          </p>
          
          {/* Search Bar */}
          <SearchBar />
        
        </div>
      </main>
      
    </div>
  );
}
