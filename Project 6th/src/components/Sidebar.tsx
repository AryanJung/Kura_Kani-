import React, { useState } from 'react';
import { SearchIcon } from '@heroicons/react/outline';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 flex-shrink-0 p-4">
      <div className="sticky top-20 bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[200px]">
        <h2 className="text-xl font-bold mb-4">Welcome!</h2>
        <p className="text-gray-600 text-center">Use the Preferences button to customize your news feed.</p>
      </div>
    </aside>
  );
};

export default Sidebar;