
import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { StoneTypology } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t } = useLanguage();

  const selectClass = "appearance-none bg-white border border-slate-200 text-slate-700 text-sm pl-10 pr-8 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#121212] focus:border-[#121212] transition-all cursor-pointer font-medium hover:border-slate-300";
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400";

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500 w-full">
      <div className="flex flex-col md:flex-row gap-4 w-full">

        {/* Search Input */}
        <div className="flex-1 relative group w-full">
          <div className={iconClass}>
            <Search className="w-4 h-4 group-focus-within:text-[#121212] transition-colors" />
          </div>
          <input
            type="text"
            placeholder={t('inv.search_placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-sm text-sm focus:ring-1 focus:ring-[#121212] focus:border-[#121212] outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-col sm:flex-row gap-4 sm:flex-wrap justify-end">

          {/* Typology Filter */}
          <div className="relative w-full sm:w-1/2 md:w-auto sm:min-w-[220px] group">
            <div className={iconClass}>
              <Filter className="w-4 h-4 group-focus-within:text-[#121212] transition-colors" />
            </div>
            <select
              value={typologyFilter}
              onChange={(e) => onTypologyFilterChange(e.target.value)}
              className={`${selectClass} w-full`}
            >
              <option value="all">{t('inv.filter.all_types')}</option>
              {typologies.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-1/2 md:w-auto sm:min-w-[220px] group">
            <div className={iconClass}>
              <SlidersHorizontal className="w-4 h-4 group-focus-within:text-[#121212] transition-colors" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className={`${selectClass} w-full`}
            >
              <option value="all">{t('inv.filter.all_status')}</option>
              <option value="available">{t('inv.status.available')}</option>
              <option value="reserved">{t('inv.status.reserved')}</option>
              <option value="sold">{t('inv.status.sold_out')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
