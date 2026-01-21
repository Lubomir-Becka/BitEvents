import React from 'react';

export interface LocationFilters {
  bratislava: boolean;
  kosice: boolean;
  online: boolean;
}

interface SidebarProps {
  selectedLocations: LocationFilters;
  onToggleLocation: (location: keyof LocationFilters) => void;
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  onReset: () => void;
}

const categories = [
  { value: 'ai', label: 'AI & Machine Learning' },
  { value: 'devops', label: 'DevOps' },
  { value: 'security', label: 'Security' },
  { value: 'web', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'data', label: 'Data Science' },
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'blockchain', label: 'Blockchain' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  selectedLocations, 
  onToggleLocation, 
  selectedCategories,
  onToggleCategory,
  dateFilter,
  onDateChange,
  onReset 
}) => {
  return (
    <div className="w-full h-fit">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20 border border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Filtre</h3>
          <button
            onClick={onReset}
            className="text-sm text-gray-500 font-medium hover:text-blue-600 transition"
          >
            Resetovať
          </button>
        </div>

        {/* Date Filter */}
        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-sm tracking-wider">DÁTUM</h4>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Location Filter */}
        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-sm tracking-wider">MIESTO</h4>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.bratislava}
                onChange={() => onToggleLocation('bratislava')}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600">Bratislava</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.kosice}
                onChange={() => onToggleLocation('kosice')}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600">Košice</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.online}
                onChange={() => onToggleLocation('online')}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600">Online</span>
            </label>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="font-bold text-gray-900 mb-3 text-sm tracking-wider">OBLASŤ</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => onToggleCategory(category.value)}
                  className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600">{category.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
