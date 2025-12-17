import React, { useState, useEffect } from 'react';
import { StoneItem, SalesDelegation, OfferLink, Seller } from '../types';
import { X, Layers, Users, Link as LinkIcon, ArrowUpRight, DollarSign, ExternalLink, Eye, User, Settings, Save, AlertTriangle, Copy, Zap, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  onDirectLink
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'links' | 'delegations' | 'stock'>('links');
  const [redirectOffer, setRedirectOffer] = useState<OfferLink | null>(null);
  
  // Local state for Stock Tab editing
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
    if (formData.totalQuantity < (stone.quantity.reserved + stone.quantity.sold)) {
      alert("Cannot reduce total quantity below currently reserved/sold amount.");
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
        available: formData.totalQuantity - (stone.quantity.reserved + stone.quantity.sold) 
      }
    };
    onUpdateStone(updatedStone);
    alert("Inventory settings updated successfully.");
  };

  // Enrich delegations with seller names
  const enrichedDelegations = delegations.map(d => ({
    ...d,
    seller: sellers.find(s => s.id === d.sellerId)
  }));

  // Enrich offers with seller names
  const enrichedOffers = offers.map(o => {
    let sellerName = t('common.direct_sale') + ' (HQ)';
    if (o.delegationId) {
      const del = delegations.find(d => d.id === o.delegationId);
      const sel = sellers.find(s => s.id === del?.sellerId);
      if (sel) sellerName = sel.name;
    }
    return { ...o, sellerName };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats
  const totalValuePotential = stone.quantity.total * stone.minPrice;
  const directLinksCount = offers.filter(o => !o.delegationId).length;
  const delegatedLinksCount = offers.filter(o => o.delegationId).length;
  const isAvailable = stone.quantity.available > 0;

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
        
        {/* Redirect Confirmation Modal (Nested) */}
        {redirectOffer && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 w-full max-w-sm text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">{t('modal.seller_inv.redirect_title')}</h3>
               <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                 {t('modal.seller_inv.redirect_msg')} <span className="font-bold text-slate-800">{redirectOffer.clientName}</span>.
               </p>
               <div className="flex gap-3">
                  <button 
                    onClick={() => setRedirectOffer(null)} 
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={confirmRedirect} 
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-600/20 transition-all"
                  >
                    {t('modal.seller_inv.proceed')}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold">{stone.typology.name}</h2>
            <div className="flex items-center text-sm text-slate-400 mt-1 space-x-3">
               <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-xs text-slate-300">
                 {t('card.lot')}: {stone.lotId}
               </span>
               <span>{stone.typology.origin}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col lg:flex-row">
            
            {/* Left Column: Master Stats */}
            <div className="lg:w-1/4 border-r border-slate-200 bg-white flex flex-col overflow-y-auto shrink-0">
               <div className="p-5 space-y-5">
                  
                  {/* Image */}
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 relative">
                     <img src={stone.imageUrl} alt="" className="w-full h-full object-cover" />
                     <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 p-4">
                        <p className="text-white font-mono text-sm">{stone.dimensions.width}x{stone.dimensions.height} {stone.dimensions.unit}</p>
                     </div>
                  </div>

                  {/* Actions: Direct & Delegate */}
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={onDirectLink}
                        disabled={!isAvailable}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm border
                          ${isAvailable 
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 border-slate-300' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'}`}
                      >
                         <Zap className="w-4 h-4 mr-2" />
                         {t('modal.ind_inv.direct')}
                      </button>
                      <button 
                        onClick={onDelegate}
                        disabled={!isAvailable}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm
                          ${isAvailable 
                            ? 'bg-slate-900 hover:bg-slate-800 text-white border border-transparent' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}`}
                      >
                         <UserPlus className="w-4 h-4 mr-2" />
                         {t('modal.ind_inv.delegate')}
                      </button>
                  </div>

                  {/* Stock Breakdown */}
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center">
                        <Layers className="w-4 h-4 mr-2" /> {t('modal.ind_inv.global_inv')}
                     </h3>
                     
                     <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-medium text-slate-600">{t('modal.ind_inv.total_batch')}</span>
                           <span className="font-bold text-slate-900">{stone.quantity.total}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                           <div style={{ width: `${(stone.quantity.sold / stone.quantity.total) * 100}%` }} className="bg-emerald-500" />
                           <div style={{ width: `${(stone.quantity.reserved / stone.quantity.total) * 100}%` }} className="bg-blue-600" />
                           <div style={{ width: `${(stone.quantity.available / stone.quantity.total) * 100}%` }} className="bg-slate-400" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                           <div className="bg-white rounded border border-slate-100 p-2">
                              <div className="text-xs text-slate-400 uppercase">{t('card.sold')}</div>
                              <div className="text-emerald-600 font-bold">{stone.quantity.sold}</div>
                           </div>
                           <div className="bg-white rounded border border-slate-100 p-2">
                              <div className="text-xs text-slate-400 uppercase">{t('card.reserved')}</div>
                              <div className="text-blue-700 font-bold">{stone.quantity.reserved}</div>
                           </div>
                           <div className="bg-white rounded border border-slate-100 p-2">
                              <div className="text-xs text-slate-400 uppercase">{t('card.avail')}</div>
                              <div className="text-slate-600 font-bold">{stone.quantity.available}</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Financial Base */}
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" /> {t('modal.ind_inv.financials')}
                     </h3>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                           <p className="text-[10px] text-slate-500 uppercase font-bold">{t('modal.ind_inv.base_cost')}</p>
                           <p className="text-lg font-bold text-slate-700">{formatCurrency(stone.baseCost)}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                           <p className="text-[10px] text-slate-500 uppercase font-bold">{t('modal.ind_inv.min_price')}</p>
                           <p className="text-lg font-bold text-slate-900">{formatCurrency(stone.minPrice)}</p>
                        </div>
                     </div>
                     <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                        <p className="text-[10px] text-blue-600 uppercase font-bold">{t('modal.ind_inv.total_value')}</p>
                        <p className="text-xl font-bold text-blue-900">{formatCurrency(totalValuePotential)}</p>
                     </div>
                  </div>

               </div>
            </div>

            {/* Right Column: Details & Tables */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
               
               {/* Tab Navigation */}
               <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6 sticky top-0 z-10">
                  <button 
                     onClick={() => setActiveTab('links')}
                     className={`pb-4 text-sm font-bold flex items-center transition-colors border-b-2 ${
                        activeTab === 'links' 
                        ? 'border-slate-900 text-slate-900' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                     }`}
                  >
                     <LinkIcon className="w-4 h-4 mr-2" />
                     {t('modal.ind_inv.tab.links')}
                     <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{offers.length}</span>
                  </button>
                  <button 
                     onClick={() => setActiveTab('delegations')}
                     className={`pb-4 text-sm font-bold flex items-center transition-colors border-b-2 ${
                        activeTab === 'delegations' 
                        ? 'border-slate-900 text-slate-900' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                     }`}
                  >
                     <Users className="w-4 h-4 mr-2" />
                     {t('modal.ind_inv.tab.delegations')}
                     <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{delegations.length}</span>
                  </button>
                  <button 
                     onClick={() => setActiveTab('stock')}
                     className={`pb-4 text-sm font-bold flex items-center transition-colors border-b-2 ${
                        activeTab === 'stock' 
                        ? 'border-emerald-600 text-emerald-900' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                     }`}
                  >
                     <Settings className="w-4 h-4 mr-2" />
                     {t('modal.ind_inv.tab.stock')}
                  </button>
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-6">
                  
                  {activeTab === 'links' && (
                     <div className="space-y-4">
                        <div className="flex gap-4 mb-4">
                           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium shadow-sm">
                              {t('modal.ind_inv.direct_hq')}: <span className="font-bold text-slate-900">{directLinksCount}</span>
                           </div>
                           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium shadow-sm">
                              {t('modal.ind_inv.delegated_links')}: <span className="font-bold text-slate-900">{delegatedLinksCount}</span>
                           </div>
                        </div>

                        {enrichedOffers.length === 0 ? (
                           <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                              {t('modal.seller_inv.no_links')}
                           </div>
                        ) : (
                           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                                    <tr>
                                       <th className="px-6 py-4 font-bold">{t('dash.table.status')}</th>
                                       <th className="px-6 py-4 font-bold">{t('modal.ind_inv.generated_by')}</th>
                                       <th className="px-6 py-4 font-bold">{t('dash.table.client')}</th>
                                       <th className="px-6 py-4 font-bold text-right">{t('dash.table.value')}</th>
                                       <th className="px-6 py-4 font-bold text-center">{t('dash.table.created')}</th>
                                       <th className="px-6 py-4 font-bold text-right">{t('dash.table.actions')}</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {enrichedOffers.map(offer => {
                                       const isSold = offer.status === 'sold';
                                       return (
                                          <tr key={offer.id} className="hover:bg-slate-50 transition-colors group">
                                             <td className="px-6 py-4">
                                                {isSold ? (
                                                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">{t('modal.history.sold')}</span>
                                                ) : offer.status === 'expired' ? (
                                                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">{t('modal.history.expired')}</span>
                                                ) : (
                                                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">{t('modal.history.active')}</span>
                                                )}
                                             </td>
                                             <td className="px-6 py-4">
                                                <div className="flex items-center font-medium text-slate-900">
                                                   {!offer.delegationId ? (
                                                      <span className="text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded mr-2">HQ</span>
                                                   ) : (
                                                      <User className="w-3 h-3 mr-2 text-slate-400" />
                                                   )}
                                                   {offer.sellerName}
                                                </div>
                                             </td>
                                             <td className="px-6 py-4 font-medium text-slate-800">
                                                {offer.clientName}
                                                <div className="text-xs text-slate-400 font-normal">{offer.quantityOffered} units</div>
                                             </td>
                                             <td className="px-6 py-4 text-right font-mono text-slate-700">
                                                {formatCurrency(offer.finalPrice)}
                                             </td>
                                             <td className="px-6 py-4 text-center text-xs text-slate-500">
                                                {formatDate(offer.createdAt)}
                                             </td>
                                             <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                   <button 
                                                      onClick={() => handleViewDetails(offer)}
                                                      className="flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                                                      title="Manage transaction details"
                                                   >
                                                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                      {t('modal.seller_inv.details')}
                                                   </button>
                                                   <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                                   <button 
                                                      onClick={() => handleCopy(offer.clientViewToken)}
                                                      className="p-2 hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900 rounded-lg transition-all border border-transparent hover:border-slate-200"
                                                      title="Copy Link"
                                                   >
                                                      <Copy className="w-4 h-4" />
                                                   </button>
                                                   <a 
                                                      href={`#${offer.clientViewToken}`}
                                                      className="p-2 hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-900 rounded-lg transition-all border border-transparent hover:border-slate-200"
                                                      title="Open Client View"
                                                   >
                                                      <ExternalLink className="w-4 h-4" />
                                                   </a>
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
                           <div className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                              {t('modal.ind_inv.no_delegations')}
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 gap-4">
                              {enrichedDelegations.map(del => {
                                 const delOffers = offers.filter(o => o.delegationId === del.id);
                                 const sold = delOffers.filter(o => o.status === 'sold').reduce((acc, curr) => acc + curr.quantityOffered, 0);
                                 
                                 return (
                                    <div key={del.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                             {del.seller?.avatarUrl ? (
                                                <img src={del.seller.avatarUrl} className="w-full h-full rounded-full object-cover" />
                                             ) : (
                                                <span className="font-bold text-slate-400 text-lg">{del.seller?.name?.[0]}</span>
                                             )}
                                          </div>
                                          <div>
                                             <h3 className="font-bold text-slate-900">{del.seller?.name}</h3>
                                             <p className="text-xs text-slate-500">Since {formatDate(del.createdAt)}</p>
                                          </div>
                                       </div>

                                       <div className="flex gap-8 text-sm">
                                          <div className="text-center">
                                             <p className="text-xs text-slate-400 font-bold uppercase">{t('modal.ind_inv.assigned')}</p>
                                             <p className="font-bold text-slate-900">{del.delegatedQuantity} {stone.quantity.unit}</p>
                                          </div>
                                          <div className="text-center">
                                             <p className="text-xs text-slate-400 font-bold uppercase">{t('card.sold')}</p>
                                             <p className="font-bold text-emerald-600">{sold}</p>
                                          </div>
                                          <div className="text-center">
                                             <p className="text-xs text-slate-400 font-bold uppercase">{t('modal.seller_inv.floor_price')}</p>
                                             <p className="font-bold text-slate-700">{formatCurrency(del.agreedMinPrice)}</p>
                                          </div>
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
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
                           <div className="p-2 bg-white rounded-full border border-emerald-100 text-emerald-600 shadow-sm">
                              <Settings className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-emerald-900">{t('modal.ind_inv.inv_correction')}</h3>
                              <p className="text-sm text-emerald-700/80 mt-1">
                                 Update total physical quantities and financial parameters. Changes here directly affect available stock and profit calculations.
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
                                 <Layers className="w-4 h-4 mr-2" /> {t('modal.ind_inv.stock_params')}
                              </h4>
                              <div className="space-y-4">
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('modal.ind_inv.total_batch')} (Physical Batch)</label>
                                    <input 
                                       type="number"
                                       min={stone.quantity.reserved + stone.quantity.sold}
                                       value={formData.totalQuantity}
                                       onChange={(e) => setFormData({...formData, totalQuantity: parseInt(e.target.value) || 0})}
                                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-2 flex items-center">
                                       <AlertTriangle className="w-3 h-3 mr-1" />
                                       {t('modal.ind_inv.min_locked')}: {stone.quantity.reserved + stone.quantity.sold}
                                    </p>
                                 </div>
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('card.lot')} / ID</label>
                                    <input 
                                       type="text"
                                       value={formData.lotId}
                                       onChange={(e) => setFormData({...formData, lotId: e.target.value})}
                                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
                                 <DollarSign className="w-4 h-4 mr-2" /> {t('modal.batch.financials')}
                              </h4>
                              <div className="space-y-4">
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('modal.ind_inv.min_price')}</label>
                                    <div className="relative">
                                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                       <input 
                                          type="number"
                                          min={0}
                                          value={formData.minPrice}
                                          onChange={(e) => setFormData({...formData, minPrice: parseFloat(e.target.value) || 0})}
                                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t('modal.ind_inv.base_cost')}</label>
                                    <div className="relative">
                                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                       <input 
                                          type="number"
                                          min={0}
                                          value={formData.baseCost}
                                          onChange={(e) => setFormData({...formData, baseCost: parseFloat(e.target.value) || 0})}
                                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-200">
                           <button 
                              onClick={handleSaveStock}
                              className="flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-base font-bold shadow-lg hover:shadow-emerald-900/20 transition-all active:scale-95"
                           >
                              <Save className="w-5 h-5 mr-2" />
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