import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onSubmit }) => {
  return (
    <div className="w-full text-white text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">
        Tvoj kompas v slovenskom <span className="text-blue-300">IT svete</span>
      </h1>
      <p className="text-blue-50 text-base sm:text-lg mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
        Objavuj najlepšie konferencie, meetupy a hackatony v Bratislave, Košiciach a online.
        Buduj svoju kariéru a networkuj s ľuďmi v odvetví.
      </p>

      {/* Search Bar */}
      <form onSubmit={onSubmit} className="relative max-w-2xl mx-auto px-4">
        <div className="flex items-center bg-white rounded-full h-14 shadow-lg px-6 pr-16">
          <span className="text-gray-400 mr-3 text-lg shrink-0">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Hľadať eventy (napr. Java, Security)..."
            className="flex-1 text-gray-900 focus:outline-none bg-transparent text-base"
          />
        </div>
        <button
          type="submit"
          className="absolute right-5 top-1 bottom-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 shadow-sm"
        >
          Hľadať
        </button>
      </form>
    </div>
  );
};
