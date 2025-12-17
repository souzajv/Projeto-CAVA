import React from 'react';
import { OfferLink, StoneItem } from '../types';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CancelLinkModalProps {
  offer: OfferLink;
  stone: StoneItem;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelLinkModal: React.FC<CancelLinkModalProps> = ({ offer, stone, onClose, onConfirm }) => {
  const { t } = useLanguage();
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="p-3 bg-rose-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">{t('modal.cancel.title')}</h2>
          <p className="text-sm text-slate-600 mb-4">
            {t('modal.cancel.msg')} <span className="font-bold text-slate-900">{offer.clientName}</span> - <span className="font-semibold">{stone.typology.name}</span>.
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500 mb-4">
            <ul className="list-disc pl-4 space-y-1">
              <li>{t('modal.cancel.bullet1')}</li>
              <li>{t('modal.cancel.bullet2')}</li>
            </ul>
          </div>

          <p className="text-sm font-medium text-slate-900">{t('modal.cancel.undone')}</p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {t('modal.cancel.keep')}
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 shadow-sm transition-colors"
          >
            {t('modal.cancel.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};