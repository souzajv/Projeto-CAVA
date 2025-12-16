import React from 'react';
import { OfferLink, StoneItem } from '../types';
import { BadgeCheck, X, ArrowRight, DollarSign } from 'lucide-react';

interface ConfirmSaleModalProps {
  offer: OfferLink;
  stone: StoneItem;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmSaleModal: React.FC<ConfirmSaleModalProps> = ({ offer, stone, onClose, onConfirm }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const totalValue = offer.finalPrice * offer.quantityOffered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="p-3 bg-emerald-100 rounded-full">
            <BadgeCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Confirm Final Sale?</h2>
          <p className="text-sm text-slate-600 mb-6">
            You are about to finalize the transaction with <span className="font-bold text-slate-900">{offer.clientName}</span>.
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Item</span>
              <span className="font-medium text-slate-900">{stone.typology.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Quantity</span>
              <span className="font-medium text-slate-900">{offer.quantityOffered} {stone.quantity.unit}</span>
            </div>
            <div className="border-t border-slate-200 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Total Revenue</span>
              <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-start gap-2">
            <div className="mt-0.5 min-w-[4px] min-h-[4px] rounded-full bg-slate-400" />
            <p>Inventory will be permanently deducted.</p>
          </div>
          <div className="text-xs text-slate-400 flex items-start gap-2 mt-1">
            <div className="mt-0.5 min-w-[4px] min-h-[4px] rounded-full bg-slate-400" />
            <p>This action marks the deal as closed and realized.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors flex items-center"
          >
            Confirm Sale <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};