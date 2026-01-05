
import React, { useEffect } from 'react';
import { SalesDelegation, OfferLink, StoneItem, Client } from '../types';
import { X, TrendingUp, Loader2, User, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSellerOffer } from '../hooks/useSellerOffer';

interface OfferModalProps {
  delegation: SalesDelegation;
  stone: StoneItem;
  clients: Client[];
  maxQuantity: number;
  onClose: () => void;
  onSuccess: (offer: OfferLink) => void;
  onAddClient?: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ 
  delegation, 
  stone, 
  clients, 
  maxQuantity, 
  onClose, 
  onSuccess,
  onAddClient 
}) => {
  const { t, formatCurrency } = useLanguage();
  
  // Use the Custom Hook for Business Logic
  const {
    salePrice,
    quantity,
    clientId,
    profit,
    errors,
    isValid,
    isSubmitting,
    setSalePrice,
    setQuantity,
    setClientId,
    setClientName,
    generateLink,
    reset
  } = useSellerOffer(delegation, maxQuantity);

  // Sync client name when ID changes
  useEffect(() => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setClientName(selected.name);
    }
  }, [clientId, clients, setClientName]);

  const handleSubmit = async () => {
    const offer = await generateLink();
    if (offer) {
      onSuccess(offer);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-5xl rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Lado Esquerdo: Resumo do Produto */}
        <div className="md:w-5/12 bg-[#121212] text-white p-8 relative overflow-hidden">
           <img src={stone.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
           <div className="relative z-10 h-full flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2410C] mb-4">Inventory Context</span>
              <h2 className="text-3xl font-serif mb-2">{stone.typology.name}</h2>
              <p className="text-slate-400 font-light mb-8">{stone.typology.origin}</p>
              
              <div className="mt-auto space-y-4 border-t border-white/10 pt-6">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 uppercase tracking-widest font-bold">Lot ID</span>
                    <span className="font-mono text-[#C2410C]">{stone.lotId}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500 uppercase tracking-widest font-bold">Floor Price</span>
                    <span>{formatCurrency(delegation.agreedMinPrice)}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="flex-1 p-10 bg-white space-y-10">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-2xl font-serif text-[#121212]">{t('modal.offer.title')}</h3>
                 <p className="text-slate-500 text-sm mt-1">{t('modal.offer.subtitle')}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
           </div>

           <div className="space-y-8">
              {/* Seleção de Cliente */}
              <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
                    {t('cli.select_existing')}
                    {onAddClient && (
                        <button 
                            onClick={onAddClient}
                            className="text-[#C2410C] hover:text-orange-700 flex items-center gap-1 transition-colors"
                        >
                            <UserPlus className="w-3 h-3" /> {t('cli.add')}
                        </button>
                    )}
                 </label>
                 <div className="relative group">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ml-1" />
                    <select 
                      value={clientId}
                      onChange={e => setClientId(e.target.value)}
                      className={`w-full pl-8 py-3 bg-transparent border-b text-sm font-medium focus:border-[#C2410C] outline-none appearance-none ${errors.clientId ? 'border-rose-500' : 'border-slate-200'}`}
                    >
                       <option value="">-- {t('common.select_placeholder')} --</option>
                       {clients.map(c => (
                         <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                       ))}
                    </select>
                 </div>
                 {errors.clientId && <p className="text-xs text-rose-500">{errors.clientId}</p>}
              </div>

              {/* Preço e Qtd */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Unit Price</label>
                    <input 
                       type="number" 
                       value={salePrice}
                       onChange={e => setSalePrice(Number(e.target.value))}
                       className={`w-full py-3 bg-transparent border-b text-2xl font-serif text-[#121212] focus:border-[#C2410C] outline-none ${errors.salePrice ? 'border-rose-500' : 'border-slate-200'}`}
                    />
                    {errors.salePrice ? (
                        <p className="text-xs text-rose-500">{errors.salePrice}</p>
                    ) : (
                        salePrice > delegation.agreedMinPrice && (
                           <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" /> Comm: {formatCurrency(profit)}
                           </p>
                        )
                    )}
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quantity (Available: {maxQuantity})</label>
                    <input 
                       type="number" 
                       min={1}
                       max={maxQuantity}
                       value={quantity}
                       onChange={e => setQuantity(Number(e.target.value))}
                       className={`w-full py-3 bg-transparent border-b text-2xl font-serif text-[#121212] focus:border-[#C2410C] outline-none ${errors.quantity ? 'border-rose-500' : 'border-slate-200'}`}
                    />
                    {errors.quantity && <p className="text-xs text-rose-500">{errors.quantity}</p>}
                 </div>
              </div>
           </div>

           <button 
             onClick={handleSubmit}
             disabled={!isValid || isSubmitting}
             className="w-full py-5 bg-[#121212] hover:bg-[#C2410C] text-white text-xs font-bold uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
           >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('modal.offer.generate_btn')}
           </button>
        </div>
      </div>
    </div>
  );
};
