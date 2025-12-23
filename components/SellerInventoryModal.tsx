
import React, { useState } from 'react';
import { SalesDelegation, StoneItem, OfferLink } from '../types';
import { X, Layers, Link as LinkIcon, ExternalLink, Copy, Plus, History, ArrowRight, Eye, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithLoader } from './ImageWithLoader';

interface SellerInventoryModalProps {
  delegation: SalesDelegation;
  stone: StoneItem;
  offers: OfferLink[];
  onClose: () => void;
  onCreateOffer: (delegation: SalesDelegation, maxQuantity: number) => void;
  onViewTransaction: (offer: OfferLink) => void;
  onViewClientPage?: (token: string) => void;
}

export const SellerInventoryModal: React.FC<SellerInventoryModalProps> = ({ 
  delegation, 
  stone, 
  offers, 
  onClose, 
  onCreateOffer, 
  onViewTransaction, 
  onViewClientPage 
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [redirectOffer, setRedirectOffer] = useState<OfferLink | null>(null);

  const soldQty = offers.filter(o => o.status === 'sold').reduce((acc, o) => acc + o.quantityOffered, 0);
  const activeQty = offers.filter(o => o.status === 'active').reduce((acc, o) => acc + o.quantityOffered, 0);
  const netAvailable = Math.max(0, delegation.delegatedQuantity - soldQty - activeQty);

  const sortedOffers = [...offers].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(`https://cava.platform/view/${token}`);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Redirect Confirmation Modal (Nested) - LUXURY REDESIGN */}
        {redirectOffer && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#121212]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-sm shadow-2xl border border-slate-100 p-8 w-full max-w-md text-center animate-in zoom-in-95 relative overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
               
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
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
                    className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-600 shadow-lg transition-all"
                  >
                    {t('modal.seller_inv.proceed')}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{stone.typology.name}</h2>
            <div className="flex items-center text-sm text-slate-500 mt-1 space-x-3">
               <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs font-medium">
                 {t('card.lot')}: {stone.lotId}
               </span>
               <span>{stone.typology.origin}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col lg:flex-row">
            
            {/* Left Column: Product & Terms */}
            <div className="lg:w-1/3 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
               <div className="p-6 space-y-6">
                  {/* Image Card */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                    <div className="aspect-video relative">
                      <ImageWithLoader 
                        src={stone.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                         <p className="font-mono text-sm font-medium">{stone.dimensions.width}x{stone.dimensions.height} {stone.dimensions.unit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center border-b border-slate-100 pb-2">
                        <Layers className="w-4 h-4 mr-2" /> {t('modal.seller_inv.stock_terms')}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                           <p className="text-xs text-blue-600 font-bold uppercase mb-1">{t('modal.seller_inv.your_stock')}</p>
                           <p className="text-xl font-bold text-blue-900">{delegation.delegatedQuantity} <span className="text-sm font-normal text-blue-700">{t(`unit.${stone.quantity.unit}`)}</span></p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                           <p className="text-xs text-emerald-600 font-bold uppercase mb-1">{t('modal.offer.available')}</p>
                           <p className="text-xl font-bold text-emerald-900">{netAvailable}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                           <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t('modal.seller_inv.floor_price')}</p>
                           <p className="text-xl font-bold text-slate-700">{formatCurrency(delegation.agreedMinPrice)}</p>
                      </div>

                      <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg">
                        {t('modal.seller_inv.terms_desc')}
                      </div>
                  </div>

                  <button 
                    onClick={() => onCreateOffer(delegation, netAvailable)}
                    disabled={netAvailable <= 0}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('modal.seller_inv.create_new')}
                    <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                  </button>
               </div>
            </div>

            {/* Right Column: History */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
               <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
                 <h3 className="text-lg font-bold text-slate-900 flex items-center">
                   <History className="w-5 h-5 mr-3 text-slate-500" />
                   {t('modal.seller_inv.history_title')}
                 </h3>
                 <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                   {sortedOffers.length} {t('dash.records_found')}
                 </span>
               </div>

               <div className="flex-1 overflow-y-auto p-8">
                 {sortedOffers.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                       <LinkIcon className="w-10 h-10 opacity-30" />
                     </div>
                     <p className="text-lg font-medium text-slate-500">{t('modal.seller_inv.no_links')}</p>
                     <button 
                        onClick={() => onCreateOffer(delegation, netAvailable)} 
                        className="mt-4 px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        disabled={netAvailable <= 0}
                     >
                        {t('card.create_offer')}
                     </button>
                   </div>
                 ) : (
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                         <tr>
                           <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.status')}</th>
                           <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.client')}</th>
                           <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.created')}</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-right">{t('modal.seller_inv.unit_price')}</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-right">{t('modal.seller_inv.est_margin')}</th>
                           <th className="px-6 py-4 font-bold tracking-wider text-right">{t('dash.table.actions')}</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {sortedOffers.map(offer => {
                           const isSold = offer.status === 'sold';
                           const isExpired = offer.status === 'expired';
                           const margin = (offer.finalPrice - delegation.agreedMinPrice) * offer.quantityOffered;
                           
                           return (
                             <tr key={offer.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-6 py-4">
                                  {isSold ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">{t('modal.history.sold')}</span>
                                  ) : isExpired ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">{t('modal.history.expired')}</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">{t('modal.history.active')}</span>
                                  )}
                               </td>
                               <td className="px-6 py-4">
                                 <div className="font-bold text-slate-900 text-base">{offer.clientName}</div>
                                 <div className="text-xs text-slate-500 font-medium mt-0.5">{offer.quantityOffered} {t(`unit.${stone.quantity.unit}`)}</div>
                               </td>
                               <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                 {formatDate(offer.createdAt)}
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <span className="font-bold text-slate-900">{formatCurrency(offer.finalPrice)}</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <span className="font-bold text-emerald-600">+{formatCurrency(margin)}</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => handleViewDetails(offer)}
                                     className="flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                                   >
                                     <Eye className="w-3.5 h-3.5 mr-1.5" />
                                     {t('modal.seller_inv.details')}
                                   </button>
                                   <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                   <button 
                                     onClick={() => handleCopy(offer.clientViewToken)}
                                     className="p-2 hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900 rounded-lg transition-all border border-transparent hover:border-slate-200"
                                   >
                                     <Copy className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => onViewClientPage?.(offer.clientViewToken)}
                                     className="p-2 hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900 rounded-lg transition-all border border-transparent hover:border-slate-200"
                                   >
                                     <ExternalLink className="w-4 h-4" />
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
