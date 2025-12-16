import React from 'react';
import { StoneTypology } from '../types';
import { Plus, ShieldCheck, FileText, Pencil } from 'lucide-react';

interface CatalogViewProps {
  typologies: StoneTypology[];
  onAddTypology: () => void;
  onEditTypology: (typology: StoneTypology) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ typologies, onAddTypology, onEditTypology }) => {
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Action */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Product Catalog</h2>
          <p className="text-sm text-slate-500">Manage stone templates and technical specifications.</p>
        </div>
        <button 
          onClick={onAddTypology}
          className="flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Typology
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Create Card (Visual Placeholder for flow) */}
        <button 
          onClick={onAddTypology}
          className="group flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all min-h-[320px]"
        >
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Plus className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
          </div>
          <span className="font-medium text-slate-600 group-hover:text-slate-900">Create New Standard</span>
        </button>

        {/* Existing Typologies */}
        {typologies.map((typology) => (
          <div key={typology.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full">
            
            {/* Image Area */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
               {typology.imageUrl ? (
                 <img src={typology.imageUrl} alt={typology.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
               )}
               
               <button 
                 onClick={() => onEditTypology(typology)}
                 className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Pencil className="w-4 h-4" />
               </button>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{typology.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                {typology.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center text-xs text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  <span className="font-medium text-slate-400 w-16">Origin:</span>
                  <span>{typology.origin}</span>
                </div>
                <div className="flex items-center text-xs text-slate-600">
                  <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  <span className="font-medium text-slate-400 w-16">Hardness:</span>
                  <span>{typology.hardness}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};