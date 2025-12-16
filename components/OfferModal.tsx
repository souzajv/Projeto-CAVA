import React from 'react';
import { SalesDelegation, OfferLink, StoneItem } from '../types';
import { useSellerOffer } from '../hooks/useSellerOffer';
import { X, TrendingUp, AlertCircle, Loader2, User, Layers, Ruler } from 'lucide-react';

interface OfferModalProps {
  delegation: SalesDelegation;
  stone: StoneItem;
  onClose: () => void;
  onSuccess: (offer: OfferLink) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ delegation, stone, onClose, onSuccess }) => {
  const {
    salePrice,
    quantity,
    clientName,
    profit,
    isValid,
    isSubmitting,
    errors,
    setSalePrice,
    setQuantity,
    setClientName,
    generateLink
  } = useSellerOffer(delegation);

  const handleSubmit = async () => {
    const offer = await generateLink();
    if (offer) {
      onSuccess(offer);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div className="bg-white w-full h-full sm:h-[600px] sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row relative animate-in zoom-in-95 duration-200">
        
        {/* Mobile Close Button (Floating) */}
        <button 
             onClick={onClose} 
             className="absolute top-4 right-4 z-50 bg-white/50 hover:bg-white text-slate-500 hover:text-slate-900 rounded-full p-2 transition-all sm:hidden backdrop-blur-md"
        >
             <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: Visuals (Hidden on tiny screens if desired, but here we stack it) */}
        <div className="relative w-full sm:w-5/12 h-48 sm:h-full bg-slate-900 shrink-0">
           <img src={stone.imageUrl} alt={stone.typology.name} className="w-full h-full object-cover opacity-80" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
           
           <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
             <div className="inline-block px-2 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest border border-white/30 rounded bg-white/10 backdrop-blur-md">
               Inventory Item
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold leading-none mb-2">{stone.typology.name}</h2>
             <p className="text-slate-300 font-medium mb-4 text-sm sm:text-base">{stone.typology.origin}</p>
             
             <div className="flex items-center gap-4 text-xs text-slate-400 font-mono border-t border-white/10 pt-4">
                <div className="flex items-center">
                  <Ruler className="w-3 h-3 mr-1.5" />
                  {stone.dimensions.width}x{stone.dimensions.height} {stone.dimensions.unit}
                </div>
                <div>Lot: {stone.lotId}</div>
             </div>
           </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="flex-1 bg-white flex flex-col relative">
           
           {/* Desktop Close Button */}
           <button 
             onClick={onClose} 
             className="hidden sm:block absolute top-4 right-4 text-slate-400 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors z-10"
           >
             <X className="w-5 h-5" />
           </button>

           <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col justify-center">
             
             <div className="mb-8 text-center sm:text-left">
               <h3 className="text-xl font-bold text-slate-900">Create Private Offer</h3>
               <p className="text-slate-500 text-sm mt-1">Configure pricing and client details for this link.</p>
             </div>

             <div className="space-y-8">
                {/* Price Input */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold uppercase text-slate-400">Sale Price (Total)</label>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Floor: {formatCurrency(delegation.agreedMinPrice)}
                    </span>
                  </div>
                  
                  <div className="relative group">
                     <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-light text-slate-300 group-focus-within:text-slate-900 transition-colors">$</span>
                     <input 
                        type="number" 
                        value={salePrice}
                        onChange={e => setSalePrice(Number(e.target.value))}
                        className="w-full pl-8 py-2 text-4xl sm:text-5xl font-bold text-slate-900 bg-transparent border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-colors placeholder-slate-200"
                        placeholder="0"
                     />
                  </div>
                  
                  {/* Profit Indicator */}
                  <div className="flex items-center min-h-[24px]">
                    {isValid ? (
                       <div className="flex items-center text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-left-2">
                         <TrendingUp className="w-4 h-4 mr-2" />
                         <span>Potential Commission: {formatCurrency(profit)}</span>
                       </div>
                    ) : (
                       <div className="flex flex-col gap-1">
                         {Object.values(errors).map((err, i) => (
                           <div key={i} className="flex items-center text-xs font-medium text-rose-500">
                              <AlertCircle className="w-3 h-3 mr-1.5" />
                              {err}
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                </div>

                {/* Secondary Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {/* Quantity */}
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400">Quantity</label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                        <Layers className="w-4 h-4 text-slate-400 mr-3" />
                        <input 
                          type="number"
                          min={1}
                          max={delegation.delegatedQuantity}
                          value={quantity}
                          onChange={e => setQuantity(Number(e.target.value))}
                          className="w-full bg-transparent font-semibold text-slate-900 outline-none"
                        />
                        <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">/ {delegation.delegatedQuantity}</span>
                      </div>
                   </div>

                   {/* Client Ref */}
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400">Client Ref</label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                        <User className="w-4 h-4 text-slate-400 mr-3" />
                        <input 
                          type="text"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          placeholder="Client Name"
                          className="w-full bg-transparent font-semibold text-slate-900 outline-none placeholder:font-normal"
                        />
                      </div>
                   </div>
                </div>
             </div>
           </div>

           {/* Footer Action */}
           <div className="p-6 sm:px-10 sm:py-6 border-t border-slate-100 bg-slate-50/50">
             <button 
               onClick={handleSubmit}
               disabled={!isValid || isSubmitting}
               className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-slate-900/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 flex justify-center items-center"
             >
               {isSubmitting ? (
                 <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Link...
                 </>
               ) : (
                 'Generate Secure Link'
               )}
             </button>
           </div>

        </div>
      </div>
    </div>
  );
};