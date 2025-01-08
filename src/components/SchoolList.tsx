import React, { useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { SchoolCard } from './SchoolCard';
import { useSchools } from '../hooks/useSchools';

export function SchoolList() {
  const observer = useRef<IntersectionObserver>();
  const {
    schools,
    loading,
    error,
    hasMore,
    loadMore,
    handleSearch
  } = useSchools();

  const lastSchoolElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search schools..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school, index) => (
          <div
            key={school.id}
            ref={index === schools.length - 1 ? lastSchoolElementRef : null}
          >
            <SchoolCard school={school} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 py-4">
          {error}
        </div>
      )}

      {!loading && !error && schools.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No schools found matching your search.
        </div>
      )}
    </div>
  );
}
