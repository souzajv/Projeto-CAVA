
import React from 'react';
import { OfferLink, StoneItem } from '../../types';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CancelLinkModalProps {
  offer: OfferLink;
  stone?: StoneItem; // Made optional to prevent crashes if data is missing
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelLinkModal: React.FC<CancelLinkModalProps> = ({ offer, stone, onClose, onConfirm }) => {
  const { t } = useLanguage();
  
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[#121212] rounded-sm shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-900 via-rose-600 to-rose-900" />
        
        <div className="p-8 pb-0 flex items-start justify-between">
          <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-serif text-white mb-4 tracking-tight">{t('modal.cancel.title')}</h2>
          <p className="text-slate-400 mb-8 leading-relaxed font-light text-lg">
            {t('modal.cancel.msg')} <span className="font-serif text-white border-b border-rose-500/30 pb-0.5">{offer.clientName}</span>.
          </p>
          
          <div className="bg-white/5 border border-white/10 p-6 mb-6 rounded-sm">
             {stone && (
                <div className="mb-4 flex items-center gap-3 pb-4 border-b border-white/5">
                   <img src={stone.imageUrl} className="w-10 h-10 object-cover grayscale opacity-70" />
                   <div>
                      <p className="text-white text-sm font-serif">{stone.typology.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t('card.lot')}: {stone.lotId}</p>
                   </div>
                </div>
             )}
            <ul className="space-y-3">
              <li className="flex items-start text-xs font-bold text-rose-400 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 mr-3 shrink-0" />
                {t('modal.cancel.bullet1')}
              </li>
              <li className="flex items-start text-xs font-bold text-rose-400 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 mr-3 shrink-0" />
                {t('modal.cancel.bullet2')}
              </li>
            </ul>
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">{t('modal.cancel.undone')}</p>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-4 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            {t('modal.cancel.keep')}
          </button>
          <button 
            onClick={onConfirm}
            className="px-8 py-4 bg-rose-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-700 shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all flex items-center"
          >
            {t('modal.cancel.confirm')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
