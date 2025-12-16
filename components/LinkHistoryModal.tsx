import React from 'react';
import { OfferLink, StoneItem, SalesDelegation } from '../types';
import { X, ExternalLink, Copy, Calendar, Clock, DollarSign, User, CheckCircle2 } from 'lucide-react';

interface LinkHistoryModalProps {
  delegation: SalesDelegation;
  stone: StoneItem;
  offers: OfferLink[];
  onClose: () => void;
}

export const LinkHistoryModal: React.FC<LinkHistoryModalProps> = ({ delegation, stone, offers, onClose }) => {
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Sort: Active first, then by date desc
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCopy = (token: string) => {
    const url = `https://cava.platform/view/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-4">
             <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img src={stone.imageUrl} alt="" className="h-full w-full object-cover" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{stone.typology.name}</h2>
                <p className="text-xs text-slate-500">Lot: {stone.lotId} • Offer History</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {sortedOffers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No links created for this stone yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedOffers.map(offer => {
                const isSold = offer.status === 'sold';
                const isExpired = new Date(offer.expiresAt || '') < new Date() && !isSold;
                
                return (
                  <div key={offer.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    {/* Left: Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        {isSold ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">Sold</span>
                        ) : isExpired ? (
                           <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200">Expired</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Active
                          </span>
                        )}
                        <h3 className="font-semibold text-slate-900">{offer.clientName}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                         <span className="flex items-center text-slate-900 font-medium">
                            <DollarSign className="w-3 h-3 text-slate-400 mr-0.5" />
                            {formatCurrency(offer.finalPrice)} <span className="text-slate-400 font-normal text-xs ml-1">/ unit</span>
                         </span>
                         <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" /> {offer.quantityOffered} {stone.quantity.unit}
                         </span>
                         <span className="flex items-center text-xs">
                            <Calendar className="w-3 h-3 mr-1" /> {formatDate(offer.createdAt)}
                         </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                       <button 
                         onClick={() => handleCopy(offer.clientViewToken)}
                         className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                       >
                         <Copy className="w-3.5 h-3.5 mr-1.5" />
                         Copy
                       </button>
                       <a 
                         href={`https://cava.platform/view/${offer.clientViewToken}`}
                         target="_blank"
                         rel="noreferrer"
                         className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
                       >
                         <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                         View
                       </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-white border-t border-slate-100 p-4 text-center text-xs text-slate-400">
           Displaying {offers.length} record{offers.length !== 1 && 's'}
        </div>
      </div>
    </div>
  );
};