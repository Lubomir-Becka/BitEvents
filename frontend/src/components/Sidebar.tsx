import React from 'react';

export interface LocationFilters {
  bratislava: boolean;
  kosice: boolean;
  online: boolean;
}

interface SidebarProps {
  selectedLocations: LocationFilters;
  onToggleLocation: (location: keyof LocationFilters) => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedLocations, onToggleLocation, onReset }) => {
  return (
    <div className="w-full h-fit">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Filtre</h3>
          <button
            onClick={onReset}
            className="text-sm text-gray-500 font-medium hover:text-blue-600 transition"
          >
            Resetovať
          </button>
        </div>

        {/* Location Filter */}
        <div className="mt-2">
          <h4 className="font-bold text-gray-900 mb-4 text-sm tracking-wider">MIESTO</h4>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.bratislava}
                onChange={() => onToggleLocation('bratislava')}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600"
              />
              <span className="ml-3 text-gray-700 group-hover:text-blue-600">Bratislava</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.kosice}
                onChange={() => onToggleLocation('kosice')}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600"
              />
              <span className="ml-3 text-gray-700 group-hover:text-blue-600">Košice</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.online}
                onChange={() => onToggleLocation('online')}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600"
              />
              <span className="ml-3 text-gray-700 group-hover:text-blue-600">Online</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
