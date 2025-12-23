
import React, { useState } from 'react';
import { StoneItem } from '../types';
import { X, Link as LinkIcon, Layers, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DirectLinkModalProps {
  stone: StoneItem;
  onClose: () => void;
  onGenerate: (price: number, quantity: number, clientName: string, daysValid: number) => void;
}

export const DirectLinkModal: React.FC<DirectLinkModalProps> = ({ stone, onClose, onGenerate }) => {
  const { t } = useLanguage();
  const [price, setPrice] = useState<number>(stone.minPrice * 1.2);
  const [quantity, setQuantity] = useState<number>(1);
  const [clientName, setClientName] = useState<string>('');
  const [validDays, setValidDays] = useState<number>(7);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(price, quantity, clientName, validDays);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="px-8 py-6 bg-[#121212] text-white flex justify-between items-center border-b border-[#222]">
          <div>
            <h2 className="font-serif text-xl tracking-wide">{t('modal.direct.title')}</h2>
            <div className="flex items-center text-xs text-emerald-400 mt-1 uppercase tracking-widest font-bold">
               {t('modal.direct.avail_stock')}: {stone.quantity.available} {stone.quantity.unit}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Price */}
            <div className="space-y-3">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.direct.price_unit')}</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#121212]">
                   <DollarSign className="w-4 h-4" />
                 </div>
                 <input 
                   type="number" 
                   value={price}
                   onChange={e => setPrice(Number(e.target.value))}
                   className="w-full pl-10 py-3 bg-white border-b border-slate-200 text-lg font-serif font-bold text-[#121212] focus:border-[#121212] outline-none rounded-none transition-colors"
                   placeholder="0.00"
                   required
                 />
               </div>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                 {t('card.floor_price')}: <span className="text-slate-600">{formatCurrency(stone.minPrice)}</span>
               </p>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.offer.qty')}</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#121212]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input 
                    type="number"
                    min={1}
                    max={stone.quantity.available}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full pl-10 py-3 bg-white border-b border-slate-200 text-lg font-serif font-bold text-[#121212] focus:border-[#121212] outline-none rounded-none transition-colors"
                  />
               </div>
            </div>

            {/* Client Ref */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.direct.client_ref')}</label>
              <input 
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder={t('modal.direct.placeholder_client')}
                className="w-full py-3 bg-white border-b border-slate-200 text-sm font-medium text-[#121212] focus:border-[#121212] outline-none rounded-none transition-colors"
              />
            </div>

            {/* Validity */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.direct.valid_days')}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#121212]">
                     <Calendar className="w-4 h-4" />
                   </div>
                   <input 
                     type="number"
                     min={1}
                     value={validDays}
                     onChange={e => setValidDays(Number(e.target.value))}
                     className="w-full pl-10 py-3 bg-white border-b border-slate-200 text-lg font-serif font-bold text-[#121212] focus:border-[#121212] outline-none rounded-none transition-colors"
                   />
                </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="px-8 py-4 bg-[#121212] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              {t('modal.direct.generate')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
