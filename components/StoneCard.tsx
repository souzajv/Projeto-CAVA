
import React from 'react';
import { StoneItem, Dimensions, SalesDelegation } from '../types';
import { Ruler, User, Link as LinkIcon, Layers, Zap, History, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithLoader } from './ImageWithLoader';

interface StoneCardProps {
  stone: StoneItem;
  role: 'industry_admin' | 'seller';
  delegation?: SalesDelegation;
  offerCount?: number;
  onDelegate?: (stone: StoneItem) => void;
  onDirectLink?: (stone: StoneItem) => void;
  onCreateOffer?: (delegation: SalesDelegation) => void;
  onViewHistory?: (delegation: SalesDelegation) => void;
  onClick?: () => void;
  index?: number;
}

const formatDim = (d: Dimensions) => `${d.width} × ${d.height} × ${d.thickness} ${d.unit}`;

export const StoneCard: React.FC<StoneCardProps> = ({ 
  stone, 
  role, 
  delegation, 
  offerCount = 0,
  onDelegate,
  onDirectLink,
  onCreateOffer,
  onViewHistory,
  onClick,
  index
}) => {
  const { t, formatCurrency } = useLanguage();
  const isAvailable = stone.quantity.available > 0;
  
  const total = stone.quantity.total;
  const availPct = (stone.quantity.available / total) * 100;
  const reservedPct = (stone.quantity.reserved / total) * 100;
  const soldPct = (stone.quantity.sold / total) * 100;

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-sm border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full ${onClick ? 'cursor-pointer' : ''} animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards hover:-translate-y-1`}
      style={{ animationDelay: index ? `${index * 100}ms` : '0ms' }}
    >
      {/* Image Header with "Magazine" Overlay */}
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 duration-500" />
        
        <ImageWithLoader
          src={stone.imageUrl} 
          alt={stone.typology.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
          containerClassName="w-full h-full"
        />
        
        {/* Floating Lot Tag */}
        <div className="absolute top-4 left-4 z-20">
           <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#121212] shadow-sm border border-white/20">
             {stone.lotId}
           </span>
        </div>

        {/* View Details Hint */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
           <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-[#121212]">
              <ArrowUpRight className="w-4 h-4" />
           </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Typology Info */}
        <div className="mb-6">
          <h3 className="font-serif font-medium text-slate-900 text-xl leading-snug group-hover:text-[#C2410C] transition-colors duration-300">
            {stone.typology.name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-medium flex items-center">
            <span className="w-2 h-px bg-[#C2410C] mr-2"></span>
            {stone.typology.origin}
          </p>
        </div>

        {/* Technical Specs */}
        <div className="flex items-center text-xs text-slate-500 mb-6 font-mono bg-slate-50 px-3 py-2 rounded-sm border border-slate-100">
          <Ruler className="w-3.5 h-3.5 mr-2 text-slate-400" />
          <span>{formatDim(stone.dimensions)}</span>
        </div>

        {/* Inventory Bar (Thin & Elegant) */}
        {role === 'industry_admin' && (
          <div className="mb-6 space-y-3">
            <div className="h-1 w-full bg-slate-100 overflow-hidden flex">
              <div style={{ width: `${soldPct}%` }} className="bg-emerald-900" /> {/* Sold is Dark Green */}
              <div style={{ width: `${reservedPct}%` }} className="bg-[#C2410C]" /> {/* Reserved is Terracotta */}
              <div style={{ width: `${availPct}%` }} className="bg-slate-300" /> {/* Available is Stone Grey */}
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className={soldPct > 0 ? "text-emerald-800" : ""}>{t('card.sold')} {stone.quantity.sold}</span>
              <span className={reservedPct > 0 ? "text-[#C2410C]" : ""}>{t('card.reserved')} {stone.quantity.reserved}</span>
              <span className={availPct > 0 ? "text-slate-600" : ""}>{t('card.avail')} {stone.quantity.available}</span>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-auto pt-5 border-t border-slate-100">
          {role === 'industry_admin' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('card.floor_price')}</span>
                <span className="font-serif text-lg font-medium text-slate-900">{formatCurrency(stone.minPrice)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); isAvailable && onDirectLink?.(stone); }}
                  disabled={!isAvailable}
                  className={`flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all border
                    ${isAvailable 
                      ? 'bg-transparent border-slate-200 text-slate-600 hover:border-[#121212] hover:text-[#121212]' 
                      : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  <Zap className="w-3 h-3 mr-2" />
                  {t('card.direct_link')}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); isAvailable && onDelegate?.(stone); }}
                  disabled={!isAvailable}
                  className={`flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all
                    ${isAvailable 
                      ? 'bg-[#121212] text-white hover:bg-[#C2410C] hover:shadow-lg' 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  <User className="w-3 h-3 mr-2" />
                  {t('card.delegate')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {delegation ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                     <div className="flex flex-col">
                        <span className="text-slate-400 uppercase font-bold text-[10px] mb-1">{t('card.your_stock')}</span>
                        <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">
                           {delegation.delegatedQuantity} {t(`unit.${stone.quantity.unit}`)}
                        </span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-slate-400 uppercase font-bold text-[10px] mb-1">{t('card.floor_price')}</span>
                        <span className="font-serif text-base text-slate-900">{formatCurrency(delegation.agreedMinPrice)}</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 px-4 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium cursor-default"
                      title="Total Generated Links"
                    >
                      <History className="w-4 h-4 mr-2 opacity-50" />
                      {offerCount}
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCreateOffer?.(delegation); }}
                      className="h-10 flex-1 flex items-center justify-center bg-[#121212] hover:bg-[#C2410C] text-white text-xs font-bold uppercase tracking-wide transition-all shadow-md"
                    >
                      <LinkIcon className="w-3 h-3 mr-2" />
                      {t('card.create_offer')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 bg-slate-50 border border-slate-100 border-dashed">
                  <span className="text-xs text-slate-400 font-medium">{t('card.not_in_showroom')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
