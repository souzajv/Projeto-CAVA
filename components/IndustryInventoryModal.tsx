
import React, { useState, useEffect } from 'react';
import { StoneItem, SalesDelegation, OfferLink, Seller } from '../types';
import { X, Layers, Users, Link as LinkIcon, ArrowUpRight, DollarSign, ExternalLink, Eye, User, Settings, Save, AlertTriangle, Copy, Zap, UserPlus, Trash2, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithLoader } from './ImageWithLoader';

interface IndustryInventoryModalProps {
  stone: StoneItem;
  delegations: SalesDelegation[];
  offers: OfferLink[]; // Global offers for this stone
  sellers: Seller[];
  onClose: () => void;
  onViewTransaction: (offer: OfferLink) => void;
  onUpdateStone: (updatedStone: StoneItem) => void;
  onDelegate: () => void;
  onDirectLink: () => void;
  onRevokeDelegation?: (delegationId: string) => void;
  onViewClientPage?: (token: string) => void;
}

export const IndustryInventoryModal: React.FC<IndustryInventoryModalProps> = ({ 
  stone, 
  delegations, 
  offers, 
  sellers,
  onClose,
  onViewTransaction,
  onUpdateStone,
  onDelegate,
  onDirectLink,
  onRevokeDelegation,
  onViewClientPage
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'links' | 'delegations' | 'stock'>('links');
  const [redirectOffer, setRedirectOffer] = useState<OfferLink | null>(null);
  
  // A stone is "fully closed" if there's no available stock AND no reserved stock (everything is sold)
  // But strictly, we can check if available == 0.
  // Actually, we should allow viewing details even if 0 available.
  const isFullyClosed = stone.quantity.available === 0 && stone.quantity.reserved === 0 && stone.quantity.sold > 0;

  const [formData, setFormData] = useState({
    totalQuantity: stone.quantity.total,
    minPrice: stone.minPrice,
    baseCost: stone.baseCost,
    lotId: stone.lotId
  });

  useEffect(() => {
    setFormData({
      totalQuantity: stone.quantity.total,
      minPrice: stone.minPrice,
      baseCost: stone.baseCost,
      lotId: stone.lotId
    });
  }, [stone]);

  const handleSaveStock = () => {
    // Validation: Total cannot be less than what is currently "Active" (Reserved + Sold)
    const minRequired = stone.quantity.reserved + stone.quantity.sold;
    if (formData.totalQuantity < minRequired) {
      alert(`Cannot reduce total quantity below ${minRequired} (Currently Reserved + Sold).`);
      return;
    }

    const updatedStone: StoneItem = {
      ...stone,
      lotId: formData.lotId,
      minPrice: formData.minPrice,
      baseCost: formData.baseCost,
      quantity: {
        ...stone.quantity,
        total: formData.totalQuantity,
        // Available will be recalculated by App.tsx logic automatically
        // but we pass a hint or just the base data.
        // Actually onUpdateStone updates rawStones, and App recalculates available.
        // So we just need to ensure 'total' is updated in the raw stone.
        available: formData.totalQuantity, // This is a placeholder, App.tsx reconciles it.
        reserved: stone.quantity.reserved,
        sold: stone.quantity.sold
      }
    };
    onUpdateStone(updatedStone);
    alert("Inventory settings updated successfully.");
  };

  const enrichedDelegations = delegations.map(d => ({
    ...d,
    seller: sellers.find(s => s.id === d.sellerId)
  }));

  const enrichedOffers = offers.map(o => {
    let sellerName = t('common.direct_sale') + ' (HQ)';
    if (o.delegationId) {
      const del = delegations.find(d => d.id === o.delegationId);
      const sel = sellers.find(s => s.id === del?.sellerId);
      if (sel) sellerName = sel.name;
    }
    return { ...o, sellerName };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalValuePotential = stone.quantity.total * stone.minPrice;
  const directLinksCount = offers.filter(o => !o.delegationId).length;
  const delegatedLinksCount = offers.filter(o => o.delegationId).length;
  const isAvailable = stone.quantity.available > 0;

  // Breakdown Calculations for Reserved Stock
  const qtyDelegated = delegations.reduce((acc, d) => acc + d.delegatedQuantity, 0);
  const qtyDirectActive = offers
      .filter(o => !o.delegationId && o.status === 'active')
      .reduce((acc, o) => acc + o.quantityOffered, 0);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-sm shadow-2xl w-[95vw] h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Redirect Modal */}
        {redirectOffer && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#121212]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-sm shadow-2xl border border-slate-100 p-8 w-full max-w-md text-center animate-in zoom-in-95 relative overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <ArrowUpRight className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-serif text-[#121212] mb-2">{t('modal.seller_inv.redirect_title')}</h3>
               <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                 {t('modal.seller_inv.redirect_msg')} <span className="font-bold text-[#121212] border-b border-slate-200 pb-0.5">{redirectOffer.clientName}</span>.
               </p>
               <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setRedirectOffer(null)} 
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:text-[#121212] transition-colors"
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

        {/* Obsidian Header */}
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
            
            {/* Left Column: Master Stats */}
            <div className="lg:w-1/4 border-r border-slate-200 bg-white flex flex-col overflow-y-auto shrink-0">
               <div className="p-6 space-y-8">
                  
                  {/* Image */}
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

                  {/* Actions: Direct & Delegate - Hidden for fully closed lots */}
                  {/* Even if 0 available, show buttons but disabled to indicate flow */}
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={onDirectLink}
                          disabled={!isAvailable}
                          className={`flex items-center justify-center px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-all border
                            ${isAvailable 
                              ? 'bg-transparent hover:bg-slate-50 text-[#121212] border-slate-200 hover:border-[#121212]' 
                              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'}`}
                        >
                           <Zap className="w-3 h-3 mr-2" />
                           {t('modal.ind_inv.direct')}
                        </button>
                        <button 
                          onClick={onDelegate}
                          disabled={!isAvailable}
                          className={`flex items-center justify-center px-4 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-lg
                            ${isAvailable 
                              ? 'bg-[#121212] hover:bg-[#C5A059] text-white border border-transparent' 
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'}`}
                        >
                           <UserPlus className="w-3 h-3 mr-2" />
                           {t('modal.ind_inv.delegate')}
                        </button>
                  </div>

                  {/* Stock Breakdown */}
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                        <Layers className="w-3 h-3 mr-2" /> {t('modal.ind_inv.global_inv')}
                     </h3>
                     
                     <div className="bg-[#FAFAFA] border border-slate-100 p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                           <span className="text-xs font-bold text-slate-500 uppercase">{t('modal.ind_inv.total_batch')}</span>
                           <span className="font-serif text-lg text-[#121212]">{stone.quantity.total}</span>
                        </div>
                        
                        <div className="w-full bg-slate-200 h-1 flex">
                           <div style={{ width: `${(stone.quantity.sold / stone.quantity.total) * 100}%` }} className="bg-emerald-600" />
                           <div style={{ width: `${(stone.quantity.reserved / stone.quantity.total) * 100}%` }} className="bg-[#C5A059]" />
                           <div style={{ width: `${(stone.quantity.available / stone.quantity.total) * 100}%` }} className="bg-slate-400" />
                        </div>

                        <div className="space-y-2 pt-1">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-wide flex items-center">
                                 <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" /> {t('card.sold')}
                              </span>
                              <span className="font-mono text-[#121212]">{stone.quantity.sold}</span>
                           </div>
                           
                           {/* Breakdown of Reserved */}
                           <div className="flex flex-col gap-1">
                               <div className="flex justify-between items-center text-xs cursor-help group/reserved">
                                  <span className="font-bold text-slate-400 uppercase tracking-wide flex items-center">
                                     <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full mr-2" /> {t('card.reserved')}
                                  </span>
                                  <span className="font-mono text-[#121212] font-bold">{stone.quantity.reserved}</span>
                               </div>
                               <div className="pl-3.5 flex flex-col gap-0.5 border-l border-slate-100 ml-1">
                                   {qtyDelegated > 0 && (
                                       <div className="flex justify-between text-[9px] text-slate-400">
                                           <span>↳ {t('modal.ind_inv.delegated')}</span>
                                           <span>{qtyDelegated}</span>
                                       </div>
                                   )}
                                   {qtyDirectActive > 0 && (
                                       <div className="flex justify-between text-[9px] text-slate-400">
                                           <span>↳ {t('modal.ind_inv.direct_active')}</span>
                                           <span>{qtyDirectActive}</span>
                                       </div>
                                   )}
                               </div>
                           </div>

                           <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 uppercase tracking-wide flex items-center">
                                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2" /> {t('card.avail')}
                              </span>
                              <span className="font-mono text-[#121212]">{stone.quantity.available}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Financial Base */}
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                        <DollarSign className="w-3 h-3 mr-2" /> {t('modal.ind_inv.financials')}
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[#FAFAFA] border border-slate-100">
                           <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{t('modal.ind_inv.base_cost')}</p>
                           <p className="text-lg font-serif text-[#121212] mt-1">{formatCurrency(stone.baseCost)}</p>
                        </div>
                        <div className="p-3 bg-[#FAFAFA] border border-slate-100">
                           <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{t('modal.ind_inv.min_price')}</p>
                           <p className="text-lg font-serif text-[#121212] mt-1">{formatCurrency(stone.minPrice)}</p>
                        </div>
                     </div>
                     <div className="p-4 bg-[#121212] text-white text-center shadow-lg">
                        <p className="text-[9px] text-[#C5A059] uppercase font-bold tracking-[0.2em]">{t('modal.ind_inv.total_value')}</p>
                        <p className="text-2xl font-serif mt-1">{formatCurrency(totalValuePotential)}</p>
                     </div>
                  </div>

               </div>
            </div>

            {/* Right Column: Details & Tables */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
               
               {/* Tab Navigation */}
               <div className="bg-white border-b border-slate-200 px-8 pt-6 flex gap-8 sticky top-0 z-10">
                  <button 
                     onClick={() => setActiveTab('links')}
                     className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center transition-colors border-b-2 ${
                        activeTab === 'links' 
                        ? 'border-[#C5A059] text-[#121212]' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                     }`}
                  >
                     <LinkIcon className="w-3 h-3 mr-2" />
                     {t('modal.ind_inv.tab.links')}
                     <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[10px]">{offers.length}</span>
                  </button>
                  <button 
                     onClick={() => setActiveTab('delegations')}
                     className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center transition-colors border-b-2 ${
                        activeTab === 'delegations' 
                        ? 'border-[#C5A059] text-[#121212]' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                     }`}
                  >
                     <Users className="w-3 h-3 mr-2" />
                     {t('modal.ind_inv.tab.delegations')}
                     <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[10px]">{delegations.length}</span>
                  </button>
                  
                  {/* Stock Tab */}
                  <button 
                       onClick={() => setActiveTab('stock')}
                       className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center transition-colors border-b-2 ${
                          activeTab === 'stock' 
                          ? 'border-[#C5A059] text-[#121212]' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                       }`}
                  >
                       <Settings className="w-3 h-3 mr-2" />
                       {t('modal.ind_inv.tab.stock')}
                  </button>
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-8">
                  
                  {activeTab === 'links' && (
                     <div className="space-y-6">
                        <div className="flex gap-4 mb-4">
                           <div className="px-4 py-2 border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-500">
                              {t('modal.ind_inv.direct_hq')}: <span className="text-[#121212] ml-1">{directLinksCount}</span>
                           </div>
                           <div className="px-4 py-2 border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-500">
                              {t('modal.ind_inv.delegated_links')}: <span className="text-[#121212] ml-1">{delegatedLinksCount}</span>
                           </div>
                        </div>

                        {enrichedOffers.length === 0 ? (
                           <div className="text-center py-20 text-slate-400 bg-white border border-dashed border-slate-200">
                              <p className="font-serif italic">{t('modal.seller_inv.no_links')}</p>
                           </div>
                        ) : (
                           <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-[#FAFAFA] border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                    <tr>
                                       <th className="px-6 py-4">{t('dash.table.status')}</th>
                                       <th className="px-6 py-4">{t('modal.ind_inv.generated_by')}</th>
                                       <th className="px-6 py-4">{t('dash.table.client')}</th>
                                       <th className="px-6 py-4 text-right">{t('dash.table.value')}</th>
                                       <th className="px-6 py-4 text-center">{t('dash.table.created')}</th>
                                       <th className="px-6 py-4 text-right">{t('dash.table.actions')}</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {enrichedOffers.map(offer => {
                                       const isSold = offer.status === 'sold';
                                       return (
                                          <tr key={offer.id} className="hover:bg-slate-50 transition-colors group">
                                             <td className="px-6 py-4">
                                                {isSold ? (
                                                   <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">{t('modal.history.sold')}</span>
                                                ) : offer.status === 'expired' ? (
                                                   <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">{t('modal.history.expired')}</span>
                                                ) : (
                                                   <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">{t('modal.history.active')}</span>
                                                )}
                                             </td>
                                             <td className="px-6 py-4">
                                                <div className="flex items-center font-medium text-slate-900">
                                                   {!offer.delegationId ? (
                                                      <span className="text-[9px] font-bold bg-[#121212] text-white px-1.5 py-0.5 rounded-sm mr-2 uppercase tracking-wide">HQ</span>
                                                   ) : (
                                                      <User className="w-3 h-3 mr-2 text-slate-400" />
                                                   )}
                                                   {offer.sellerName}
                                                </div>
                                             </td>
                                             <td className="px-6 py-4">
                                                <div className="font-bold text-[#121212]">{offer.clientName}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{offer.quantityOffered} {t(`unit.${stone.quantity.unit}`)}</div>
                                             </td>
                                             <td className="px-6 py-4 text-right font-serif text-slate-900">
                                                {formatCurrency(offer.finalPrice)}
                                             </td>
                                             <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">
                                                {formatDate(offer.createdAt)}
                                             </td>
                                             <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                   <button 
                                                      onClick={() => handleViewDetails(offer)}
                                                      className="text-slate-400 hover:text-[#121212] transition-colors"
                                                      title="Details"
                                                   >
                                                      <Eye className="w-4 h-4" />
                                                   </button>
                                                   <button 
                                                      onClick={() => handleCopy(offer.clientViewToken)}
                                                      className="text-slate-400 hover:text-[#121212] transition-colors"
                                                      title="Copy Link"
                                                   >
                                                      <Copy className="w-4 h-4" />
                                                   </button>
                                                   <button 
                                                      onClick={() => onViewClientPage?.(offer.clientViewToken)}
                                                      className="text-slate-400 hover:text-[#C5A059] transition-colors"
                                                      title="Open Page"
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
                  )}

                  {activeTab === 'delegations' && (
                     <div className="space-y-4">
                        {enrichedDelegations.length === 0 ? (
                           <div className="text-center py-20 text-slate-400 bg-white border border-dashed border-slate-200">
                              <p className="font-serif italic">{t('modal.ind_inv.no_delegations')}</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 gap-4">
                              {enrichedDelegations.map(del => {
                                 const delOffers = offers.filter(o => o.delegationId === del.id);
                                 const sold = delOffers.filter(o => o.status === 'sold').reduce((acc, curr) => acc + curr.quantityOffered, 0);
                                 const hasActive = delOffers.some(o => o.status === 'active');
                                 
                                 return (
                                    <div key={del.id} className="bg-white border border-slate-200 p-6 shadow-sm flex items-center justify-between group hover:border-[#121212] transition-colors">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                             {del.seller?.avatarUrl ? (
                                                <img src={del.seller.avatarUrl} className="w-full h-full rounded-full object-cover" />
                                             ) : (
                                                <span className="font-serif font-bold text-slate-400 text-lg">{del.seller?.name?.[0]}</span>
                                             )}
                                          </div>
                                          <div>
                                             <h3 className="font-bold text-[#121212] text-sm uppercase tracking-wide">{del.seller?.name}</h3>
                                             <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Since {formatDate(del.createdAt)}</p>
                                          </div>
                                       </div>

                                       <div className="flex gap-10 text-sm items-center">
                                          <div className="text-center">
                                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('modal.ind_inv.assigned')}</p>
                                             <p className="font-serif text-lg text-[#121212]">{del.delegatedQuantity}</p>
                                          </div>
                                          <div className="text-center">
                                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('card.sold')}</p>
                                             <p className="font-serif text-lg text-emerald-600">{sold}</p>
                                          </div>
                                          <div className="text-center">
                                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('modal.seller_inv.floor_price')}</p>
                                             <p className="font-serif text-lg text-slate-700">{formatCurrency(del.agreedMinPrice)}</p>
                                          </div>
                                          
                                          {/* Enhanced Revoke Button */}
                                          {onRevokeDelegation && (
                                            <div className="pl-6 border-l border-slate-100">
                                                <button 
                                                    onClick={() => onRevokeDelegation(del.id)}
                                                    disabled={hasActive}
                                                    title={hasActive ? t('modal.ind_inv.tooltip_active') : sold > 0 ? t('modal.ind_inv.revoke_remaining') : t('modal.ind_inv.remove_access')}
                                                    className={`flex items-center px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                        hasActive 
                                                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                                                        : sold > 0 
                                                            ? 'bg-slate-100 text-slate-600 hover:bg-[#121212] hover:text-white' // Reclaim mode
                                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' // Delete mode
                                                    }`}
                                                >
                                                    {sold > 0 ? (
                                                        <>
                                                            <RotateCcw className="w-3 h-3 mr-2" />
                                                            {t('modal.ind_inv.revoke_remaining')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-3 h-3 mr-2" />
                                                            {t('modal.ind_inv.remove_access')}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'stock' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-[#121212] p-6 flex items-start gap-5 shadow-xl">
                           <Settings className="w-6 h-6 text-[#C5A059] mt-1" />
                           <div>
                              <h3 className="text-lg font-serif text-white">{t('modal.ind_inv.inv_correction')}</h3>
                              <p className="text-sm text-slate-400 mt-2 font-light leading-relaxed max-w-xl">
                                 {t('modal.ind_inv.inv_correction_desc')}
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center border-b border-slate-200 pb-2">
                                 <Layers className="w-3 h-3 mr-2" /> {t('modal.ind_inv.stock_params')}
                              </h4>
                              <div className="space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">{t('modal.ind_inv.total_batch')} (Physical)</label>
                                    <input 
                                       type="number"
                                       min={stone.quantity.reserved + stone.quantity.sold}
                                       value={formData.totalQuantity}
                                       onChange={(e) => setFormData({...formData, totalQuantity: parseInt(e.target.value) || 0})}
                                       className="w-full py-2 bg-transparent border-b border-slate-300 text-xl font-serif text-[#121212] focus:border-[#121212] outline-none transition-colors"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center uppercase tracking-wider font-bold">
                                       <AlertTriangle className="w-3 h-3 mr-1 text-[#C5A059]" />
                                       {t('modal.ind_inv.min_locked')}: <span className="text-[#121212] ml-1">{stone.quantity.reserved + stone.quantity.sold}</span>
                                    </p>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">{t('card.lot')} / ID</label>
                                    <input 
                                       type="text"
                                       readOnly
                                       disabled
                                       value={formData.lotId}
                                       className="w-full py-2 bg-transparent border-b border-slate-200 text-base font-mono text-slate-400 focus:outline-none cursor-not-allowed select-none"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center border-b border-slate-200 pb-2">
                                 <DollarSign className="w-3 h-3 mr-2" /> {t('modal.batch.financials')}
                              </h4>
                              <div className="space-y-6">
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">{t('modal.ind_inv.min_price')}</label>
                                    <div className="relative group">
                                       <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                       <input 
                                          type="number"
                                          min={0}
                                          value={formData.minPrice}
                                          onChange={(e) => setFormData({...formData, minPrice: parseFloat(e.target.value) || 0})}
                                          className="w-full pl-6 py-2 bg-transparent border-b border-slate-300 text-xl font-medium text-[#121212] focus:border-[#121212] outline-none transition-colors"
                                       />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">{t('modal.ind_inv.base_cost')}</label>
                                    <div className="relative group">
                                       <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                       <input 
                                          type="number"
                                          min={0}
                                          value={formData.baseCost}
                                          onChange={(e) => setFormData({...formData, baseCost: parseFloat(e.target.value) || 0})}
                                          className="w-full pl-6 py-2 bg-transparent border-b border-slate-300 text-xl font-medium text-[#121212] focus:border-[#121212] outline-none transition-colors"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-200">
                           <button 
                              onClick={handleSaveStock}
                              className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] shadow-lg transition-all flex items-center"
                           >
                              <Save className="w-4 h-4 mr-2" />
                              {t('modal.ind_inv.save_changes')}
                           </button>
                        </div>
                     </div>
                  )}

               </div>
            </div>

        </div>
      </div>
    </div>
  );
};
