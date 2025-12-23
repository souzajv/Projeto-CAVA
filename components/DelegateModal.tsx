
import React, { useState } from 'react';
import { Seller, StoneItem } from '../types';
import { X, Check, Lock, ChevronDown, User, DollarSign, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DelegateModalProps {
  stone: StoneItem;
  sellers: Seller[];
  onClose: () => void;
  onConfirm: (sellerId: string, quantity: number, minPrice: number) => void;
}

export const DelegateModal: React.FC<DelegateModalProps> = ({ stone, sellers, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [selectedSellerId, setSelectedSellerId] = useState<string>(sellers[0]?.id || '');
  const [agreedPrice, setAgreedPrice] = useState<number>(stone.minPrice);
  const [delegatedQty, setDelegatedQty] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedSellerId, delegatedQty, agreedPrice);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm p-4 transition-all duration-500"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Obsidian Header */}
        <div className="px-8 py-6 border-b border-[#222] flex justify-between items-center bg-[#121212] sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-serif text-white tracking-wide">{t('modal.delegate.title')}</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{t('modal.delegate.subtitle')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            
            {/* Product Context - Editorial Card */}
            <div className="flex gap-6 p-6 bg-[#FAFAFA] border border-slate-100">
              <div className="h-24 w-24 shrink-0 overflow-hidden bg-slate-200 shadow-sm">
                <img src={stone.imageUrl} alt={stone.typology.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-serif text-2xl text-[#121212] mb-2">{stone.typology.name}</h3>
                <div className="flex items-center text-xs space-x-4">
                  <span className="font-bold uppercase tracking-widest text-slate-400">
                    {t('card.lot')}: <span className="text-[#121212]">{stone.lotId}</span>
                  </span>
                  <span className="w-px h-3 bg-slate-300" />
                  <span className="font-bold uppercase tracking-widest text-emerald-600">
                    {t('modal.offer.available')}: {stone.quantity.available} {stone.quantity.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Select Seller */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {t('modal.delegate.select_partner')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#121212]">
                    <User className="w-4 h-4" />
                  </div>
                  <select 
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border-b border-slate-200 text-sm font-medium text-[#121212] focus:border-[#121212] outline-none appearance-none rounded-none transition-colors"
                  >
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>{seller.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  <span>{t('modal.delegate.qty_to_delegate')}</span>
                  <span className="text-[10px] text-slate-300">{t('modal.delegate.max')}: {stone.quantity.available}</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#121212]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input 
                    type="number"
                    required
                    min={1}
                    max={stone.quantity.available}
                    value={delegatedQty}
                    onChange={(e) => setDelegatedQty(Number(e.target.value))}
                    className="w-full pl-10 py-3 bg-white border-b border-slate-200 text-lg font-serif text-[#121212] focus:border-[#121212] outline-none rounded-none transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold uppercase tracking-widest text-slate-400">
                    {stone.quantity.unit}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cost Price (Locked) */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                  <span>{t('modal.delegate.base_cost')}</span>
                  <Lock className="w-3 h-3 text-slate-300" />
                </label>
                <div className="w-full py-3 px-0 border-b border-slate-100 text-lg font-serif text-slate-300 cursor-not-allowed select-none">
                    {formatCurrency(stone.baseCost)}
                </div>
              </div>

              {/* Minimum Price */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {t('modal.delegate.floor_limit')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#121212]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input 
                    type="number"
                    required
                    min={stone.minPrice}
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value))}
                    className="w-full pl-9 py-3 bg-white border-b border-slate-200 text-lg font-serif text-[#121212] focus:border-[#121212] outline-none rounded-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-[#FAFAFA] border-t border-slate-200 flex items-center justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#121212] transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-lg flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              {t('modal.delegate.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
