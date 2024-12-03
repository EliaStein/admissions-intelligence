import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { School } from '../types/essay';
import { SchoolCard } from './SchoolCard';

interface SchoolListProps {
  schools: School[];
}

export function SchoolList({ schools }: SchoolListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search schools..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <SchoolCard key={school.name} school={school} />
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No schools found matching your search.
        </div>
      )}
    </div>
  );
}
