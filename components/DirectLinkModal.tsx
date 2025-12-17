import React, { useState } from 'react';
import { StoneItem } from '../types';
import { X, Link as LinkIcon, Layers, Calendar, DollarSign, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DirectLinkModalProps {
  stone: StoneItem;
  onClose: () => void;
  onGenerate: (price: number, quantity: number, clientName: string, daysValid: number) => void;
}

export const DirectLinkModal: React.FC<DirectLinkModalProps> = ({ stone, onClose, onGenerate }) => {
  const { t } = useLanguage();
  const [price, setPrice] = useState<number>(stone.minPrice * 1.2); // Default 20% margin
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-lg">{t('modal.direct.title')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Info Banner */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-sm">
             <span className="text-slate-500">{t('modal.direct.avail_stock')}:</span>
             <span className="font-bold text-slate-900">{stone.quantity.available} {stone.quantity.unit}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-4">
               {/* Price Input */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-900">{t('modal.direct.price_unit')}</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                     <DollarSign className="w-5 h-5" />
                   </div>
                   <input 
                     type="number" 
                     value={price}
                     onChange={e => setPrice(Number(e.target.value))}
                     className="w-full pl-10 py-3 bg-white border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                     placeholder="0.00"
                     required
                   />
                 </div>
                 <p className="text-xs text-slate-500">
                   {t('card.floor_price')}: {formatCurrency(stone.minPrice)}
                 </p>
               </div>

               {/* Client Ref */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-900">{t('modal.direct.client_ref')}</label>
                 <input 
                   type="text"
                   value={clientName}
                   onChange={e => setClientName(e.target.value)}
                   placeholder={t('modal.direct.placeholder_client')}
                   className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                 />
               </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
               {/* Quantity */}
               <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-900">{t('modal.offer.qty')}</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <input 
                        type="number"
                        min={1}
                        max={stone.quantity.available}
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full pl-9 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                   </div>
               </div>

               {/* Days */}
               <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-900">{t('modal.direct.valid_days')}</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input 
                        type="number"
                        min={1}
                        value={validDays}
                        onChange={e => setValidDays(Number(e.target.value))}
                        className="w-full pl-9 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                   </div>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center"
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