import React from 'react';
import { StoneItem, Dimensions, SalesDelegation } from '../types';
import { Ruler, User, Link as LinkIcon, Layers, Zap, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StoneCardProps {
  stone: StoneItem;
  role: 'industry_admin' | 'seller';
  delegation?: SalesDelegation; // Present if viewing as seller
  offerCount?: number; // Added for Seller View stats
  onDelegate?: (stone: StoneItem) => void;
  onDirectLink?: (stone: StoneItem) => void;
  onCreateOffer?: (delegation: SalesDelegation) => void;
  onViewHistory?: (delegation: SalesDelegation) => void;
  onClick?: () => void; // General click handler for the card body
}

const formatDim = (d: Dimensions) => `${d.width}x${d.height}x${d.thickness} ${d.unit}`;
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export const StoneCard: React.FC<StoneCardProps> = ({ 
  stone, 
  role, 
  delegation, 
  offerCount = 0,
  onDelegate,
  onDirectLink,
  onCreateOffer,
  onViewHistory,
  onClick
}) => {
  const { t } = useLanguage();
  const isAvailable = stone.quantity.available > 0;
  
  // Percentage Calculation for Visual Bar (RF-003)
  const total = stone.quantity.total;
  const availPct = (stone.quantity.available / total) * 100;
  const reservedPct = (stone.quantity.reserved / total) * 100;
  const soldPct = (stone.quantity.sold / total) * 100;

  return (
    <div 
      onClick={onClick}
      className={`group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={stone.imageUrl} 
          alt={stone.typology.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
          {t('card.lot')}: {stone.lotId}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Typology Info (RF-001) */}
        <div className="mb-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{stone.typology.name}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">{stone.typology.origin} • {stone.typology.hardness}</p>
        </div>

        {/* Dimensions */}
        <div className="flex items-center text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg inline-block w-full">
          <Ruler className="w-4 h-4 mr-2 text-slate-400" />
          <span className="font-mono">{formatDim(stone.dimensions)}</span>
        </div>

        {/* Inventory Status Bar (RF-003) - Only visible to Industry */}
        {role === 'industry_admin' && (
          <div className="mb-5 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-700">{t('card.sold')}: {stone.quantity.sold}</span>
              <span className="text-blue-700">{t('card.reserved')}: {stone.quantity.reserved}</span>
              <span className="text-slate-600">{t('card.avail')}: {stone.quantity.available}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: `${soldPct}%` }} className="bg-emerald-500" />
              <div style={{ width: `${reservedPct}%` }} className="bg-blue-600" />
              <div style={{ width: `${availPct}%` }} className="bg-slate-400" />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100">
          {role === 'industry_admin' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{t('card.floor_price')}:</span>
                <span className="font-bold text-slate-900">{formatCurrency(stone.minPrice)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); isAvailable && onDirectLink?.(stone); }}
                  disabled={!isAvailable}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-slate-200
                    ${isAvailable 
                      ? 'bg-white hover:bg-slate-50 text-slate-700' 
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}
                >
                  <Zap className="w-3 h-3 mr-1.5" />
                  {t('card.direct_link')}
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); isAvailable && onDelegate?.(stone); }}
                  disabled={!isAvailable}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors 
                    ${isAvailable 
                      ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  <User className="w-3 h-3 mr-1.5" />
                  {t('card.delegate')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {delegation ? (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-1">
                    <div className="flex justify-between items-center text-xs text-blue-800">
                       <span className="font-semibold flex items-center"><Layers className="w-3 h-3 mr-1"/> {t('card.your_stock')}</span>
                       <span className="font-mono bg-white px-1.5 rounded border border-blue-200">
                         {delegation.delegatedQuantity} {stone.quantity.unit}
                       </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-blue-600">
                       <span>{t('card.floor_price')}</span>
                       <span>{formatCurrency(delegation.agreedMinPrice)}</span>
                    </div>
                  </div>
                  
                  {/* Action Row */}
                  <div className="flex items-center gap-2">
                    {/* Changed from button to visual indicator as requested */}
                    <div 
                      className="flex items-center justify-center px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-xs font-medium cursor-default"
                      title="Total Generated Links"
                    >
                      <History className="w-4 h-4 mr-1.5 opacity-70" />
                      {offerCount} {t('card.links')}
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCreateOffer?.(delegation); }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      {t('card.create_offer')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-slate-400 italic py-2">
                  {t('card.not_in_showroom')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};