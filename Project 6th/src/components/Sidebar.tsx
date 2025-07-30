import React, { useState } from 'react';
import { SearchIcon } from '@heroicons/react/outline';

interface SidebarProps {
  onFilterChange: (filters: {
    entertainment: boolean;
    sports: boolean;
    crime: boolean;
    politics: boolean;
  }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    entertainment: true,
    sports: false,
    crime: true,
    politics: false,
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [name]: checked };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  return (
    <aside className="w-64 flex-shrink-0 p-4">
       <div className="sticky top-20 bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg">
         <div className="relative mb-8">
         {/* <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />*/}
        </div>
        
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <div className="space-y-2">
          {Object.entries(filters).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                name={key}
                checked={value}
                onChange={handleFilterChange}
                className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 capitalize">{key}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;