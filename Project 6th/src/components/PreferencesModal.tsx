import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setUserPreferences, getUserPreferences } from '../services/api';

const CATEGORIES = [
  'entertainment',
  'sports',
  'crime',
  'politics',
];

interface PreferencesModalProps {
  initialPreferences?: string[];
  onSave?: (categories: string[]) => void;
  onClose: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ initialPreferences = [], onSave, onClose }) => {
  const { user } = useAuth();
  // Only set initial state once on mount
  const [selected, setSelected] = useState<string[]>(() => {
    if (user) {
      return getUserPreferences(user.username);
    } else {
      return initialPreferences;
    }
  });

  const toggleCategory = (category: string) => {
    setSelected((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    if (user) {
      setUserPreferences(user.username, selected);
    }
    if (onSave) onSave(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Select Your News Preferences</h2>
        <div className="flex flex-col gap-3 mb-6">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 capitalize text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSave}
            disabled={selected.length === 0}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;