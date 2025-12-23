
import React from 'react';
import { StoneTypology } from '../types';
import { Pencil, Search, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CatalogViewProps {
  typologies: StoneTypology[];
  fullTypologyList: StoneTypology[]; // List for the dropdown filter
  searchTerm: string;
  onSearchChange: (val: string) => void;
  typologyFilter: string;
  onTypologyFilterChange: (val: string) => void;
  onEditTypology: (typology: StoneTypology) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ 
  typologies, 
  fullTypologyList,
  searchTerm,
  onSearchChange,
  typologyFilter,
  onTypologyFilterChange,
  onEditTypology 
}) => {
  const { t } = useLanguage();

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Search & Filter Bar - Obsidian Style */}
      <div className="mb-10 flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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

          {/* Typology Filter Dropdown */}
          <div className="relative min-w-[200px] group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4 group-focus-within:text-[#121212] transition-colors" />
            </div>
            <select
              value={typologyFilter}
              onChange={(e) => onTypologyFilterChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm pl-10 pr-8 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#121212] focus:border-[#121212] transition-all cursor-pointer font-medium hover:border-slate-300 w-full"
            >
              <option value="all">{t('inv.filter.all_types')}</option>
              {fullTypologyList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
      </div>

      {typologies.length === 0 ? (
        <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-sm bg-white">
           <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
           <p className="text-lg font-medium font-serif italic">{t('inv.no_results')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {typologies.map((typology) => (
            <div 
              key={typology.id} 
              onClick={() => onEditTypology(typology)}
              className="group bg-white rounded-sm border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer hover:-translate-y-1"
            >
              
              {/* Image Area */}
              <div className="relative h-64 bg-slate-100 overflow-hidden">
                 {typology.imageUrl ? (
                   <img src={typology.imageUrl} alt={typology.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300 font-serif italic">{t('cat.no_image')}</div>
                 )}
                 
                 <div 
                   className="absolute top-4 right-4 p-2 bg-white rounded-full text-[#121212] shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300"
                 >
                   <Pencil className="w-4 h-4" />
                 </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-serif text-[#121212] mb-3 leading-tight group-hover:text-[#C5A059] transition-colors">{typology.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1 font-light leading-relaxed">
                  {typology.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center text-xs">
                    <span className="font-bold uppercase tracking-widest text-slate-400 w-20">{t('client.origin')}</span>
                    <span className="text-[#121212] font-medium">{typology.origin}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="font-bold uppercase tracking-widest text-slate-400 w-20">{t('modal.type.hardness')}</span>
                    <span className="text-[#121212] font-medium">{typology.hardness}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
