
import React, { useState } from 'react';
import { SalesDelegation, StoneItem, OfferLink } from '../types';
import { X, Layers, Link as LinkIcon, ExternalLink, Copy, Plus, History, ArrowRight, Eye, ArrowUpRight, DollarSign, Package, Lock, BadgeCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithLoader } from './ImageWithLoader';
import { PLATFORM_DOMAIN } from '../constants';
import { StatusBadge } from './Badge';

interface SellerInventoryModalProps {
  delegation: SalesDelegation;
  stone: StoneItem;
  offers: OfferLink[];
  onClose: () => void;
  onCreateOffer: (delegation: SalesDelegation, maxQuantity: number) => void;
  onViewTransaction: (offer: OfferLink) => void;
  onViewClientPage?: (token: string) => void;
  onRequestReservation?: (offer: OfferLink) => void;
  onFinalizeSale?: (offer: OfferLink) => void;
}

export const SellerInventoryModal: React.FC<SellerInventoryModalProps> = ({ 
  delegation, 
  stone, 
  offers, 
  onClose, 
  onCreateOffer, 
  onViewTransaction, 
  onViewClientPage,
  onRequestReservation,
  onFinalizeSale
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [redirectOffer, setRedirectOffer] = useState<OfferLink | null>(null);

  // Status breakdown
  const soldQty = offers.filter(o => o.status === 'sold' || o.status === 'reserved').reduce((acc, o) => acc + o.quantityOffered, 0);
  const activeQty = offers.filter(o => o.status === 'active' || o.status === 'reservation_pending').reduce((acc, o) => acc + o.quantityOffered, 0);
  const netAvailable = Math.max(0, delegation.delegatedQuantity - soldQty - activeQty);

  const sortedOffers = [...offers].sort((a, b) => {
    const getPriority = (status: string) => {
        if (status === 'reservation_pending') return 5;
        if (status === 'active') return 4;
        if (status === 'reserved') return 3;
        if (status === 'sold') return 2;
        return 1;
    }
    return getPriority(b.status) - getPriority(a.status) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(`${PLATFORM_DOMAIN}/view/${token}`);
    alert('Link copied!');
  };

  const handleViewDetails = (offer: OfferLink) => {
    setRedirectOffer(offer);
  };

  const confirmRedirect = () => {
    if (redirectOffer) {
      onViewTransaction(redirectOffer);
      setRedirectOffer(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-sm shadow-2xl w-[95vw] h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {redirectOffer && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#121212]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-sm shadow-2xl border border-slate-100 p-8 w-full max-w-md text-center animate-in zoom-in-95 relative overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C2410C] via-yellow-200 to-[#C2410C]" />
               <div className="w-16 h-16 bg-[#C2410C]/10 text-[#C2410C] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C2410C]/20">
                  <ArrowUpRight className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-serif text-[#121212] mb-3">{t('modal.seller_inv.redirect_title')}</h3>
               <p className="text-slate-500 mb-8 leading-relaxed font-light">
                 {t('modal.seller_inv.redirect_msg')} <span className="font-bold text-[#121212] border-b border-slate-200 pb-0.5">{redirectOffer.clientName}</span>.
               </p>
               <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setRedirectOffer(null)} 
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:text-[#121212] hover:border-slate-300 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={confirmRedirect} 
                    className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C2410C] shadow-lg transition-all"
                  >
                    {t('modal.seller_inv.proceed')}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-[#222] flex justify-between items-center bg-[#121212] text-white shrink-0">
          <div>
            <h2 className="text-2xl font-serif tracking-wide">{stone.typology.name}</h2>
            <div className="flex items-center text-sm text-slate-400 mt-1 space-x-3">
               <span className="text-xs font-bold uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-sm">
                 {t('card.lot')}: {stone.lotId}
               </span>
               <span className="font-light">{stone.typology.origin}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-[#FAFAFA] flex flex-col lg:flex-row">
            
            {/* Left Column */}
            <div className="lg:w-1/3 border-r border-slate-200 bg-white flex flex-col overflow-y-auto shrink-0">
               <div className="p-6 space-y-8">
                  <div className="aspect-square bg-slate-100 overflow-hidden relative shadow-sm">
                      <ImageWithLoader 
                        src={stone.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-4">
                         <p className="text-white font-mono text-sm">{stone.dimensions.width}x{stone.dimensions.height} {stone.dimensions.unit}</p>
                      </div>
                  </div>

                  <button 
                    onClick={() => onCreateOffer(delegation, netAvailable)}
                    disabled={netAvailable <= 0}
                    className="w-full py-4 bg-[#121212] hover:bg-[#C2410C] text-white rounded-sm font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('modal.seller_inv.create_new')}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                  </button>

                  <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <Layers className="w-3 h-3 mr-2" /> {t('modal.seller_inv.stock_terms')}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#FAFAFA] border border-slate-100">
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('modal.seller_inv.your_stock')}</p>
                           <p className="text-2xl font-serif text-[#121212]">{delegation.delegatedQuantity} <span className="text-xs font-sans font-medium text-slate-400">{t(`unit.${stone.quantity.unit}`)}</span></p>
                        </div>
                        <div className="p-4 bg-[#FAFAFA] border border-slate-100">
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('modal.offer.available')}</p>
                           <p className="text-2xl font-serif text-emerald-600">{netAvailable}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-[#121212] text-white text-center shadow-lg">
                           <p className="text-[9px] text-[#C2410C] uppercase font-bold tracking-[0.2em] mb-1">{t('modal.seller_inv.floor_price')}</p>
                           <p className="text-2xl font-serif">{formatCurrency(delegation.agreedMinPrice)}</p>
                      </div>
                  </div>
               </div>
            </div>

            {/* Right Column: History */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
               <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10 sticky top-0">
                 <h3 className="font-serif font-bold text-[#121212] text-lg flex items-center">
                   {t('modal.seller_inv.history_title')}
                 </h3>
                 <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {sortedOffers.length} {t('dash.records_found')}
                    </span>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8">
                 {sortedOffers.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 border border-dashed border-slate-200 bg-white">
                     <Package className="w-12 h-12 mb-4 opacity-10" />
                     <p className="text-lg font-serif italic text-slate-400">{t('modal.seller_inv.no_links')}</p>
                     <button 
                        onClick={() => onCreateOffer(delegation, netAvailable)} 
                        className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-sm text-xs uppercase font-bold text-slate-700 hover:bg-[#121212] hover:text-white transition-colors tracking-widest"
                        disabled={netAvailable <= 0}
                     >
                        {t('card.create_offer')}
                     </button>
                   </div>
                 ) : (
                   <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                     <table className="w-full text-sm text-left">
                       <thead className="text-[10px] text-slate-400 uppercase bg-[#FAFAFA] font-bold tracking-widest border-b border-slate-200">
                         <tr>
                           <th className="px-6 py-4">{t('dash.table.status')}</th>
                           <th className="px-6 py-4">{t('dash.table.client')}</th>
                           <th className="px-6 py-4">{t('dash.table.created')}</th>
                           <th className="px-6 py-4 text-right">{t('modal.seller_inv.unit_price')}</th>
                           <th className="px-6 py-4 text-right">{t('modal.seller_inv.est_margin')}</th>
                           <th className="px-6 py-4 text-right">{t('dash.table.actions')}</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {sortedOffers.map(offer => {
                           const margin = (offer.finalPrice - delegation.agreedMinPrice) * offer.quantityOffered;
                           
                           return (
                             <tr key={offer.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-6 py-4">
                                  <StatusBadge status={offer.status} />
                               </td>
                               <td className="px-6 py-4">
                                 <div className="font-bold text-[#121212] group-hover:text-[#C2410C] transition-colors">{offer.clientName}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{offer.quantityOffered} {t(`unit.${stone.quantity.unit}`)}</div>
                               </td>
                               <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                                 {formatDate(offer.createdAt)}
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <span className="font-serif text-[#121212] text-lg">{formatCurrency(offer.finalPrice)}</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <span className="font-bold text-emerald-600 text-sm">+{formatCurrency(margin)}</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   {/* Reserve Request Button */}
                                   {offer.status === 'active' && onRequestReservation && (
                                      <button 
                                        onClick={() => onRequestReservation(offer)}
                                        className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-sm border border-purple-100 transition-colors"
                                        title="Request Reservation"
                                      >
                                        <Lock className="w-3.5 h-3.5" />
                                      </button>
                                   )}

                                   {/* Finalize Sale */}
                                   {offer.status === 'active' && onFinalizeSale && (
                                      <button 
                                         onClick={() => onFinalizeSale(offer)}
                                         className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-sm transition-colors"
                                         title="Finalize Sale"
                                      >
                                         <BadgeCheck className="w-3.5 h-3.5" />
                                      </button>
                                   )}

                                   <button 
                                     onClick={() => handleViewDetails(offer)}
                                     className="p-2 text-slate-400 hover:text-[#121212] transition-colors"
                                     title={t('modal.seller_inv.details')}
                                   >
                                     <Eye className="w-3.5 h-3.5" />
                                   </button>
                                   <button 
                                     onClick={() => handleCopy(offer.clientViewToken)}
                                     className="p-2 text-slate-400 hover:text-[#121212] transition-colors"
                                     title="Copy Link"
                                   >
                                     <Copy className="w-3.5 h-3.5" />
                                   </button>
                                   <button 
                                     onClick={() => onViewClientPage?.(offer.clientViewToken)}
                                     className="p-2 text-slate-400 hover:text-[#C2410C] transition-colors"
                                     title="Open Page"
                                   >
                                     <ExternalLink className="w-3.5 h-3.5" />
                                   </button>
                                 </div>
                               </td>
                             </tr>
                           );
                         })}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
            </div>

        </div>
      </div>
    </div>
  );
};
