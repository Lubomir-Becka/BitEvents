import React from 'react';
import type { Event as ApiEvent } from '../services/api';

export type Event = ApiEvent;

interface EventCardProps {
  event: ApiEvent;
  onClick?: (event: ApiEvent) => void;
}

const getCategoryColor = (category: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    'Development': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Security': { bg: 'bg-red-100', text: 'text-red-700' },
    'AI & Data': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'DevOps': { bg: 'bg-green-100', text: 'text-green-700' },
    'Infrastructure': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Design': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'Mobile': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    'Technológie': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Vzdelávanie': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  };
  return colorMap[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Neznámy dátum';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return 'Neznámy dátum';
    }
    
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If event is in the future
    if (diffDays > 0) {
      if (diffDays === 1) return 'Zajtra';
      if (diffDays < 7) return `O ${diffDays} dní`;
      if (diffDays < 14) return 'O týždeň';
      if (diffDays < 30) return `O ${Math.floor(diffDays / 7)} týždne`;
    }
    
    // Format the date nicely
    return date.toLocaleDateString('sk-SK', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Neznámy dátum';
  }
};

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const colorClass = getCategoryColor(event.type);

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer w-full text-left"
    >
      <div className="h-48 bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden relative">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-5xl">📅</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex gap-2 mb-3">
          <span className={`${colorClass.bg} ${colorClass.text} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}>
            {event.type || 'Iné'}
          </span>
        </div>
        <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 leading-tight">
          {event.name}
        </h4>
        <div className="space-y-2">
          <p className="text-gray-600 text-sm flex items-center gap-2">
            <span>📍</span>
            <span>{event.venue?.city || 'Neznáme miesto'}</span>
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-2">
            <span>🕒</span>
            <span>{formatDate(event.startDateTime)}</span>
          </p>
          {event.price !== undefined && (
            <p className="text-blue-600 text-sm font-semibold flex items-center gap-2">
              <span>💰</span>
              <span>{event.price === 0 ? 'Zadarmo' : `${event.price}€`}</span>
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
