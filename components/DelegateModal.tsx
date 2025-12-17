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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{t('modal.delegate.title')}</h2>
            <p className="text-sm text-slate-500">{t('modal.delegate.subtitle')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Product Context */}
            <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-200 shadow-sm border border-slate-200">
                <img src={stone.imageUrl} alt={stone.typology.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-medium text-slate-900">{stone.typology.name}</h3>
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">
                    {t('card.lot')}: {stone.lotId}
                  </span>
                  <span className="text-emerald-600 font-medium">
                    {t('modal.offer.available')}: {stone.quantity.available} {stone.quantity.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Seller */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  {t('modal.delegate.select_partner')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <select 
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none appearance-none shadow-sm transition-shadow hover:border-slate-400"
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
                <label className="text-sm font-medium text-slate-900 flex items-center justify-between">
                  <span>{t('modal.delegate.qty_to_delegate')}</span>
                  <span className="text-xs text-slate-500">{t('modal.delegate.max')}: {stone.quantity.available}</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input 
                    type="number"
                    required
                    min={1}
                    max={stone.quantity.available}
                    value={delegatedQty}
                    onChange={(e) => setDelegatedQty(Number(e.target.value))}
                    className="w-full pl-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sm text-slate-400">
                    {stone.quantity.unit}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Price */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>{t('modal.delegate.base_cost')}</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <div className="w-full py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium cursor-not-allowed select-none shadow-inner">
                    {formatCurrency(stone.baseCost)}
                </div>
              </div>

              {/* Minimum Price */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-900 flex items-center">
                  {t('modal.delegate.floor_limit')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input 
                    type="number"
                    required
                    min={stone.minPrice}
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value))}
                    className="w-full pl-9 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all shadow-md flex items-center"
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