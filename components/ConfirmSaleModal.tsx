
import React from 'react';
import { OfferLink, StoneItem } from '../types';
import { BadgeCheck, X, ArrowRight, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmSaleModalProps {
  offer: OfferLink;
  stone?: StoneItem;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmSaleModal: React.FC<ConfirmSaleModalProps> = ({ offer, stone, onClose, onConfirm }) => {
  const { t, formatCurrency } = useLanguage();
  const totalValue = offer.finalPrice * offer.quantityOffered;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#121212] rounded-sm shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-[#C2410C]/30 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C2410C] via-orange-400 to-[#C2410C]" />

        <div className="p-8 pb-0 flex items-start justify-between">
          <div className="p-3 bg-[#C2410C]/10 rounded-full border border-[#C2410C]/30">
            <BadgeCheck className="w-8 h-8 text-[#C2410C]" />
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-serif text-white mb-4">{t('modal.confirm.title')}</h2>
          <p className="text-slate-400 mb-8 font-light text-lg">
            {t('modal.confirm.msg')} <span className="text-white font-serif border-b border-[#C2410C]/50">{offer.clientName}</span>.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-sm p-6 mb-8 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <DollarSign className="w-24 h-24 text-white rotate-12" />
            </div>

            {stone && (
                <div className="flex justify-between items-center text-sm relative z-10">
                <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">{t('modal.confirm.item')}</span>
                <span className="font-serif text-white text-lg">{stone.typology.name}</span>
                </div>
            )}
            <div className="flex justify-between items-center text-sm relative z-10">
              <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">{t('modal.offer.qty')}</span>
              <span className="font-mono text-white">{offer.quantityOffered} {stone ? t(`unit.${stone.quantity.unit}`) : 'units'}</span>
            </div>
            
            <div className="border-t border-white/10 my-2"></div>
            
            <div className="flex justify-between items-end relative z-10">
              <span className="text-[10px] font-bold text-[#C2410C] uppercase tracking-widest">{t('modal.confirm.total_rev')}</span>
              <span className="text-2xl font-serif text-white">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
                {t('modal.confirm.deduct_msg')}
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
                {t('modal.confirm.close_msg')}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-4 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={onConfirm}
            className="px-8 py-4 bg-[#C2410C] text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-800 shadow-[0_0_20px_rgba(194,65,12,0.3)] transition-all flex items-center"
          >
            {t('modal.confirm.btn')} <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
