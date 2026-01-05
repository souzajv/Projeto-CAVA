
import React, { useState, useMemo } from 'react';
import { Client, OfferLink, StoneItem, Seller, SalesDelegation, UserRole } from '../types';
import { X, Save, User, Building2, Mail, Phone, AlignLeft, History, Package, DollarSign, Clock, ExternalLink, UserCircle, Pencil, Search, Filter, ShieldCheck, Tag, Lock, BadgeCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ClientDetailsModalProps {
  client: Client;
  offers: OfferLink[];
  stones: StoneItem[];
  sellers: Seller[];
  delegations: SalesDelegation[];
  role: UserRole;
  onClose: () => void;
  onSave: (updatedClient: Client) => void;
  onViewClientPage?: (token: string) => void;
  onRequestReservation?: (offer: OfferLink) => void;
  onApproveReservation?: (offer: OfferLink) => void;
  onFinalizeSale?: (offer: OfferLink) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ 
  client, 
  offers = [], 
  stones = [], 
  sellers = [], 
  delegations = [],
  role,
  onClose, 
  onSave,
  onViewClientPage,
  onRequestReservation,
  onApproveReservation,
  onFinalizeSale
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...client });
  
  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sold' | 'active'>('all');
  const [sellerFilter, setSellerFilter] = useState('all');

  const clientOffers = useMemo(() => {
    let base = offers.filter(o => o.clientId === client.id);
    
    // Status Filter
    if (statusFilter === 'sold') base = base.filter(o => o.status === 'sold');
    if (statusFilter === 'active') base = base.filter(o => o.status === 'active');
    
    // Seller Filter (Admin only)
    if (role === 'industry_admin' && sellerFilter !== 'all') {
       base = base.filter(o => {
          if (sellerFilter === 'hq') return !o.delegationId;
          const del = delegations.find(d => d.id === o.delegationId);
          return del?.sellerId === sellerFilter;
       });
    }

    // Text Search
    if (historySearch.trim()) {
       const lower = historySearch.toLowerCase();
       base = base.filter(o => {
          const stone = stones.find(s => s.id === o.stoneId);
          return (
            stone?.typology.name.toLowerCase().includes(lower) ||
            stone?.lotId.toLowerCase().includes(lower)
          );
       });
    }

    return base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [offers, client.id, statusFilter, sellerFilter, historySearch, role, delegations, stones]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const getSellerName = (offer: OfferLink) => {
    if (!offer.delegationId) return t('common.direct_sale') + ' (HQ)';
    const del = delegations.find(d => d.id === offer.delegationId);
    if (!del) return '---';
    const sel = sellers.find(s => s.id === del.sellerId);
    return sel ? sel.name : 'Partner';
  };

  const creatorName = useMemo(() => {
    if (client.createdByRole === 'industry_admin') return 'CAVA HQ Admin';
    const sel = sellers.find(s => s.id === client.createdById);
    return sel ? sel.name : 'Unknown Seller';
  }, [client, sellers]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]/90 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col border border-white/10" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-6 bg-[#121212] text-white flex justify-between items-center border-b border-[#222] shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-[#C2410C] flex items-center justify-center font-serif font-bold text-2xl shadow-lg border border-white/10">
                {client.name.charAt(0)}
             </div>
             <div>
                <h2 className="font-serif text-3xl tracking-wide">{client.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {client.company || 'Private Client'}
                   </p>
                   <span className="w-1 h-1 bg-white/20 rounded-full" />
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center">
                      <Clock className="w-3 h-3 mr-1.5 text-slate-500" /> {t('cli.label.member_since')}: {formatDate(client.createdAt)}
                   </p>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
           
           {/* Left Panel: Client Info */}
           <div className="lg:w-80 xl:w-96 border-r border-slate-100 bg-[#FAFAFA] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t('cli.modal.edit')}</h3>
                 {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="group flex items-center text-[10px] font-bold uppercase tracking-widest text-[#C2410C] hover:text-orange-800 transition-colors"
                    >
                       <Pencil className="w-3 h-3 mr-1.5 group-hover:scale-110 transition-transform" />
                       {t('cli.modal.edit_btn')}
                    </button>
                 )}
              </div>

              {/* Registration Audit Badge */}
              <div className="mb-10 p-4 bg-white border border-slate-200 shadow-sm rounded-sm">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1.5 text-emerald-500" /> {t('cli.label.registered_by')}
                 </p>
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                       <UserCircle className="w-full h-full text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-[#121212]">{creatorName}</span>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                       <User className="w-3 h-3 mr-1.5" /> {t('cli.label.name')}
                    </label>
                    {isEditing ? (
                       <input 
                         required
                         type="text"
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full py-2 bg-white border-b border-slate-300 focus:border-[#121212] outline-none text-sm font-medium transition-colors"
                       />
                    ) : (
                       <p className="text-sm font-bold text-[#121212] py-2">{client.name}</p>
                    )}
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                       <Building2 className="w-3 h-3 mr-1.5" /> {t('cli.label.company')}
                    </label>
                    {isEditing ? (
                       <input 
                         type="text"
                         value={formData.company}
                         onChange={e => setFormData({...formData, company: e.target.value})}
                         className="w-full py-2 bg-white border-b border-slate-300 focus:border-[#121212] outline-none text-sm font-medium transition-colors"
                       />
                    ) : (
                       <p className="text-sm font-medium text-slate-600 py-2">{client.company || '---'}</p>
                    )}
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                          <Mail className="w-3 h-3 mr-1.5" /> {t('cli.label.email')}
                       </label>
                       {isEditing ? (
                          <input 
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full py-2 bg-white border-b border-slate-300 focus:border-[#121212] outline-none text-sm font-medium transition-colors"
                          />
                       ) : (
                          <p className="text-sm font-medium text-slate-600 py-2 truncate">{client.email}</p>
                       )}
                    </div>

                    <div className="space-y-1">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                          <Phone className="w-3 h-3 mr-1.5" /> {t('cli.label.phone')}
                       </label>
                       {isEditing ? (
                          <input 
                            required
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full py-2 bg-white border-b border-slate-300 focus:border-[#121212] outline-none text-sm font-medium transition-colors"
                          />
                       ) : (
                          <p className="text-sm font-medium text-slate-600 py-2">{client.phone}</p>
                       )}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                       <AlignLeft className="w-3 h-3 mr-1.5" /> {t('cli.label.notes')}
                    </label>
                    {isEditing ? (
                       <textarea 
                         rows={5}
                         value={formData.notes}
                         onChange={e => setFormData({...formData, notes: e.target.value})}
                         className="w-full p-4 bg-white border border-slate-200 focus:border-[#121212] outline-none text-sm font-medium resize-none transition-colors shadow-inner"
                       />
                    ) : (
                       <p className="text-sm font-light text-slate-500 py-2 italic leading-relaxed bg-slate-50/50 p-4 border border-dashed border-slate-200 rounded-sm">
                          {client.notes || t('cli.label.no_notes')}
                       </p>
                    )}
                 </div>

                 {isEditing && (
                    <div className="pt-6 flex gap-4">
                       <button 
                         type="button" 
                         onClick={() => { setFormData({...client}); setIsEditing(false); }}
                         className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#121212] transition-colors"
                       >
                          {t('common.cancel')}
                       </button>
                       <button 
                         type="submit"
                         className="flex-1 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C2410C] shadow-lg transition-all flex items-center justify-center"
                       >
                          <Save className="w-3.5 h-3.5 mr-2" /> {t('common.save')}
                       </button>
                    </div>
                 )}
              </form>
           </div>

           {/* Right Panel: Link History with Filters */}
           <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Toolbar */}
              <div className="px-10 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-white sticky top-0 z-10 shadow-sm">
                 <h3 className="font-serif font-bold text-[#121212] text-2xl flex items-center">
                    <History className="w-6 h-6 mr-3 text-[#C2410C]" /> {t('cli.history.title')}
                 </h3>
                 
                 <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Search inside history */}
                    <div className="relative flex-1 md:w-48 group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#C2410C]" />
                       <input 
                          type="text" 
                          placeholder={t('cli.history.search_placeholder')}
                          value={historySearch}
                          onChange={e => setHistorySearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 focus:border-[#C2410C] outline-none rounded-none transition-all"
                       />
                    </div>

                    {/* Status Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-sm gap-1">
                       <button 
                          onClick={() => setStatusFilter('all')}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-none transition-all ${statusFilter === 'all' ? 'bg-white text-[#121212] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                          {t('cli.history.filter_all')}
                       </button>
                       <button 
                          onClick={() => setStatusFilter('sold')}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-none transition-all ${statusFilter === 'sold' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                          {t('cli.history.filter_sold')}
                       </button>
                       <button 
                          onClick={() => setStatusFilter('active')}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-none transition-all ${statusFilter === 'active' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                          {t('cli.history.filter_active')}
                       </button>
                    </div>

                    {/* Seller Filter (Only Admin) */}
                    {role === 'industry_admin' && (
                       <div className="relative group">
                          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <select 
                             value={sellerFilter}
                             onChange={e => setSellerFilter(e.target.value)}
                             className="pl-9 pr-8 py-2 text-[10px] font-bold uppercase tracking-widest border border-slate-200 bg-white outline-none appearance-none rounded-none cursor-pointer focus:border-[#C2410C]"
                          >
                             <option value="all">{t('cli.history.seller_filter')}</option>
                             <option value="hq">CAVA HQ</option>
                             {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                       </div>
                    )}
                 </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-10 bg-[#FAFAFA]/30">
                 {clientOffers.length === 0 ? (
                    <div className="py-32 text-center text-slate-400 border border-dashed border-slate-200 bg-white flex flex-col items-center">
                       <Package className="w-16 h-16 mb-4 opacity-5" />
                       <p className="font-serif italic text-lg">{t('cli.history.empty')}</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {clientOffers.map(offer => {
                          const stone = stones.find(s => s.id === offer.stoneId);
                          const isSold = offer.status === 'sold';
                          const isExpired = offer.status === 'expired';
                          const isReserved = offer.status === 'reserved';
                          const isPending = offer.status === 'reservation_pending';
                          
                          return (
                             <div key={offer.id} className="group bg-white border border-slate-200 hover:border-[#121212] transition-all p-0 flex flex-col md:flex-row relative overflow-hidden shadow-sm">
                                {isSold && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                                {isReserved && <div className="absolute top-0 left-0 w-1 h-full bg-[#C2410C]" />}
                                {isPending && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 animate-pulse" />}
                                
                                {/* Stone Visual Panel */}
                                <div className="w-full md:w-32 bg-slate-50 shrink-0 border-r border-slate-100 overflow-hidden relative">
                                   {stone && <img src={stone.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />}
                                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>

                                {/* Info Panel */}
                                <div className="flex-1 p-6">
                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                      <div>
                                         <h4 className="font-serif font-bold text-xl text-[#121212] group-hover:text-[#C2410C] transition-colors leading-tight">
                                            {stone?.typology.name || 'Unknown Material'}
                                         </h4>
                                         <div className="flex items-center gap-3 mt-1.5">
                                            <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                               <Tag className="w-3 h-3 mr-1 text-slate-300" /> {stone?.lotId}
                                            </span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                               {offer.quantityOffered} {t(`unit.${stone?.quantity.unit || 'slabs'}`)}
                                            </span>
                                         </div>
                                      </div>
                                      <div className="shrink-0">
                                         {isSold ? (
                                            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-emerald-100">
                                               {t('dash.status.sold')}
                                            </span>
                                         ) : isExpired ? (
                                            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] border border-slate-200">
                                               {t('dash.status.expired')}
                                            </span>
                                         ) : isReserved ? (
                                            <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-amber-100">
                                               {t('card.reserved')}
                                            </span>
                                         ) : isPending ? (
                                            <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-purple-100 animate-pulse">
                                               REQUEST
                                            </span>
                                         ) : (
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-blue-100">
                                               {t('dash.status.active')}
                                            </span>
                                         )}
                                      </div>
                                   </div>

                                   <div className="flex flex-wrap gap-x-8 gap-y-4 items-center pt-4 border-t border-slate-50">
                                      <div className="flex flex-col">
                                         <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{t('modal.tx.created')}</span>
                                         <span className="text-xs font-mono text-slate-600">{formatDate(offer.createdAt)}</span>
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{t('dash.table.seller')}</span>
                                         <div className="flex items-center text-xs font-bold text-[#121212]">
                                            <UserCircle className="w-3.5 h-3.5 mr-1.5 text-[#C2410C]" /> {getSellerName(offer)}
                                         </div>
                                      </div>
                                      <div className="flex flex-col ml-auto text-right">
                                         <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{t('dash.table.value')}</span>
                                         <span className="text-2xl font-serif text-[#121212] group-hover:text-[#C2410C] transition-colors">
                                            {formatCurrency(offer.finalPrice * offer.quantityOffered)}
                                         </span>
                                      </div>
                                      
                                      <div className="shrink-0 flex items-center gap-2 pl-6 ml-2 border-l border-slate-100">
                                         {/* Action Buttons */}
                                         {offer.status === 'active' && (
                                            <>
                                               {/* Reserve: Seller Request */}
                                               {role === 'seller' && onRequestReservation && (
                                                  <button 
                                                     onClick={() => onRequestReservation(offer)}
                                                     className="p-3 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 transition-all rounded-sm"
                                                     title="Request Reservation"
                                                  >
                                                     <Lock className="w-4 h-4" />
                                                  </button>
                                               )}
                                               {/* Reserve: Admin Approve/Set */}
                                               {role === 'industry_admin' && onApproveReservation && (
                                                  <button 
                                                     onClick={() => onApproveReservation(offer)}
                                                     className="p-3 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 transition-all rounded-sm"
                                                     title="Reserve Now"
                                                  >
                                                     <Lock className="w-4 h-4" />
                                                  </button>
                                               )}
                                               
                                               {/* Finalize Sale */}
                                               {onFinalizeSale && (
                                                  <button 
                                                     onClick={() => onFinalizeSale(offer)}
                                                     className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-all rounded-sm"
                                                     title="Finalize Sale"
                                                  >
                                                     <BadgeCheck className="w-4 h-4" />
                                                  </button>
                                               )}
                                            </>
                                         )}

                                         <button 
                                            onClick={() => onViewClientPage?.(offer.clientViewToken)}
                                            className="p-3 bg-slate-50 hover:bg-[#121212] hover:text-white border border-slate-200 transition-all shadow-sm rounded-sm"
                                            title="Open Secure Offer View"
                                         >
                                            <ExternalLink className="w-4 h-4" />
                                         </button>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
