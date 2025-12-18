
import React from 'react';
import { StoneTypology } from '../types';
import { Plus, ShieldCheck, FileText, Pencil, Search, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CatalogViewProps {
  typologies: StoneTypology[];
  fullTypologyList: StoneTypology[]; // List for the dropdown filter
  searchTerm: string;
  onSearchChange: (val: string) => void;
  typologyFilter: string;
  onTypologyFilterChange: (val: string) => void;
  onAddTypology: () => void;
  onEditTypology: (typology: StoneTypology) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ 
  typologies, 
  fullTypologyList,
  searchTerm,
  onSearchChange,
  typologyFilter,
  onTypologyFilterChange,
  onAddTypology, 
  onEditTypology 
}) => {
  const { t } = useLanguage();

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('cat.title')}</h2>
          <p className="text-sm text-slate-500">{t('cat.subtitle')}</p>
        </div>
        <button 
          onClick={onAddTypology}
          className="flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('cat.add_btn')}
        </button>
      </div>

      {/* Search & Filter Bar - Consistent with InventoryFilters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder={t('inv.search_placeholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Typology Filter Dropdown */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={typologyFilter}
              onChange={(e) => onTypologyFilterChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer"
            >
              <option value="all">{t('inv.filter.all_types')}</option>
              {fullTypologyList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {typologies.length === 0 ? (
        <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
           <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
           <p className="text-lg font-medium">{t('inv.no_results')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {typologies.map((typology) => (
            <div 
              key={typology.id} 
              onClick={() => onEditTypology(typology)}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full cursor-pointer"
            >
              
              {/* Image Area */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                 {typology.imageUrl ? (
                   <img src={typology.imageUrl} alt={typology.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">{t('cat.no_image')}</div>
                 )}
                 
                 <div 
                   className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Pencil className="w-4 h-4" />
                 </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{typology.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {typology.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center text-xs text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-400 w-16">{t('client.origin')}:</span>
                    <span>{typology.origin}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-600">
                    <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-400 w-16">{t('modal.type.hardness')}:</span>
                    <span>{typology.hardness}</span>
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
