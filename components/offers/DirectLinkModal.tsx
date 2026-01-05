
import React, { useState } from 'react';
import { StoneItem, Client } from '../../types';
import { X, Link as LinkIcon, Layers, Calendar, DollarSign, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DirectLinkModalProps {
  stone: StoneItem;
  clients: Client[];
  onClose: () => void;
  onGenerate: (price: number, quantity: number, clientId: string, clientName: string, daysValid: number) => void;
}

export const DirectLinkModal: React.FC<DirectLinkModalProps> = ({ stone, clients, onClose, onGenerate }) => {
  const { t, formatCurrency } = useLanguage();
  const [price, setPrice] = useState<number>(stone.minPrice * 1.2);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [validDays, setValidDays] = useState<number>(7);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    onGenerate(price, quantity, selectedClient.id, selectedClient.name, validDays);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/10" onClick={(e) => e.stopPropagation()}>
        
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
          <div className="space-y-3">
             <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('cli.select_existing')}</label>
             <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ml-1" />
                <select 
                  required
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full pl-8 py-3 bg-transparent border-b border-slate-200 text-sm font-medium focus:border-[#C2410C] outline-none appearance-none"
                >
                   <option value="">-- {t('common.select_placeholder')} --</option>
                   {clients.map(c => (
                     <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                   ))}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.direct.price_unit')}</label>
               <input 
                 type="number" 
                 value={price}
                 onChange={e => setPrice(Number(e.target.value))}
                 className="w-full py-3 bg-white border-b border-slate-200 text-lg font-serif font-bold text-[#121212] focus:border-[#C2410C] outline-none"
                 required
               />
            </div>
            <div className="space-y-3">
               <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.offer.qty')}</label>
               <input 
                 type="number"
                 min={1}
                 max={stone.quantity.available}
                 value={quantity}
                 onChange={e => setQuantity(Number(e.target.value))}
                 className="w-full py-3 bg-white border-b border-slate-200 text-lg font-serif font-bold text-[#121212] focus:border-[#C2410C] outline-none"
               />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              disabled={!selectedClientId}
              className="px-8 py-4 bg-[#121212] hover:bg-[#C2410C] text-white text-xs font-bold uppercase tracking-widest shadow-xl transition-all flex items-center disabled:opacity-20"
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
