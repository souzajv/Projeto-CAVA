import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { StoneTypology } from '../types';

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  typologyFilter: string;
  onTypologyFilterChange: (val: string) => void;
  typologies: StoneTypology[];
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typologyFilter,
  onTypologyFilterChange,
  typologies
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text"
            placeholder="Search by Lot ID, Name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex gap-4">
          
          {/* Typology Filter */}
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={typologyFilter}
              onChange={(e) => onTypologyFilterChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Typologies</option>
              {typologies.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="available">Available Stock</option>
              <option value="reserved">Reserved/Delegated</option>
              <option value="sold">Sold Out</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};