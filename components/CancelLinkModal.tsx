import React from 'react';
import { OfferLink, StoneItem } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface CancelLinkModalProps {
  offer: OfferLink;
  stone: StoneItem;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelLinkModal: React.FC<CancelLinkModalProps> = ({ offer, stone, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="p-3 bg-rose-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Cancel Active Link?</h2>
          <p className="text-sm text-slate-600 mb-4">
            You are about to cancel the link for <span className="font-bold text-slate-900">{offer.clientName}</span> regarding <span className="font-semibold">{stone.typology.name}</span>.
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500 mb-4">
            <ul className="list-disc pl-4 space-y-1">
              <li>The client will no longer be able to access the offer.</li>
              <li>The <strong>{offer.quantityOffered} {stone.quantity.unit}</strong> reserved for this link will be released back to available stock immediately.</li>
            </ul>
          </div>

          <p className="text-sm font-medium text-slate-900">This action cannot be undone.</p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Keep Active
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 shadow-sm transition-colors"
          >
            Yes, Cancel Link
          </button>
        </div>
      </div>
    </div>
  );
};