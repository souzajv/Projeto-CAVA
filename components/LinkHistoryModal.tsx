
import React from 'react';
import { OfferLink, StoneItem, SalesDelegation } from '../types';
import { X, ExternalLink, Copy, Calendar, Clock, DollarSign, User, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PLATFORM_DOMAIN } from '../constants';

interface LinkHistoryModalProps {
  delegation: SalesDelegation;
  stone: StoneItem;
  offers: OfferLink[];
  onClose: () => void;
}

export const LinkHistoryModal: React.FC<LinkHistoryModalProps> = ({ delegation, stone, offers, onClose }) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  
  // Sort: Active first, then by date desc
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCopy = (token: string) => {
    const url = `${PLATFORM_DOMAIN}/view/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-5">
             <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                <img src={stone.imageUrl} alt="" className="h-full w-full object-cover" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{stone.typology.name}</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('card.lot')}: {stone.lotId} • {t('modal.history.title')}</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {sortedOffers.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">{t('modal.history.no_links')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedOffers.map(offer => {
                const isSold = offer.status === 'sold';
                const isExpired = new Date(offer.expiresAt || '') < new Date() && !isSold;
                
                return (
                  <div key={offer.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-center gap-6">
                    
                    {/* Left: Info */}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center space-x-3">
                        {isSold ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">{t('modal.history.sold')}</span>
                        ) : isExpired ? (
                           <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider border border-slate-200">{t('modal.history.expired')}</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {t('modal.history.active')}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900">{offer.clientName}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                         <span className="flex items-center text-slate-900 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <DollarSign className="w-4 h-4 text-emerald-600 mr-0.5" />
                            {formatCurrency(offer.finalPrice)} <span className="text-slate-400 font-normal text-xs ml-1">/ unit</span>
                         </span>
                         <span className="flex items-center font-medium">
                            <User className="w-4 h-4 mr-1.5 text-slate-400" /> {offer.quantityOffered} {stone.quantity.unit}
                         </span>
                         <span className="flex items-center font-medium">
                            <Calendar className="w-4 h-4 mr-1.5 text-slate-400" /> {formatDate(offer.createdAt)}
                         </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                       <button 
                         onClick={() => handleCopy(offer.clientViewToken)}
                         className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                       >
                         <Copy className="w-4 h-4 mr-2" />
                         {t('modal.history.copy')}
                       </button>
                       <a 
                         href={`${PLATFORM_DOMAIN}/view/${offer.clientViewToken}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                       >
                         <ExternalLink className="w-4 h-4 mr-2" />
                         {t('modal.history.view')}
                       </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-white border-t border-slate-100 p-5 text-center text-sm text-slate-400 font-medium">
           {t('modal.history.displaying')} {offers.length} record{offers.length !== 1 && 's'}
        </div>
      </div>
    </div>
  );
};
