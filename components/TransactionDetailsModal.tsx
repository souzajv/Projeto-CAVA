import React from 'react';
import { OfferLink, StoneItem, Seller, UserRole, SalesDelegation } from '../types';
import { X, Calendar, User, DollarSign, Layers, MapPin, ShieldCheck, ExternalLink, Trash2, BadgeCheck, Copy, Clock, Eye, TrendingUp, Wallet } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionDetailsModalProps {
  transaction: {
    offer: OfferLink;
    stone: StoneItem;
    seller?: Seller;
    delegation?: SalesDelegation;
  };
  role: UserRole;
  onClose: () => void;
  // Fix: Removed duplicate onFinalizeSale declaration
  onFinalizeSale?: (offer: OfferLink) => void;
  onCancelLink?: (offer: OfferLink) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  transaction, 
  role, 
  onClose,
  onFinalizeSale,
  onCancelLink
}) => {
  const { t, formatCurrency, formatDate, formatDateTime } = useLanguage();
  const { offer, stone, seller, delegation } = transaction;

  const isSold = offer.status === 'sold';
  const isExpired = offer.status === 'expired';
  const isActive = offer.status === 'active';
  const totalValue = offer.finalPrice * offer.quantityOffered;

  // --- Profit Calculation Logic ---
  let costBasis = 0;
  let profitLabel = '';
  let profitIcon = TrendingUp;
  
  if (role === 'industry_admin') {
    costBasis = stone.baseCost * offer.quantityOffered;
    profitLabel = isSold ? t('dash.kpi.profit_admin') : 'Est. Net Profit';
  } else {
    costBasis = (delegation?.agreedMinPrice || 0) * offer.quantityOffered;
    profitLabel = isSold ? t('dash.kpi.profit_seller') : 'Est. Commission';
    profitIcon = Wallet;
  }
  
  const profitValue = totalValue - costBasis;
  const marginPercent = totalValue > 0 ? (profitValue / totalValue) * 100 : 0;

  const handleCopyLink = () => {
    const url = `https://cava.platform/view/${offer.clientViewToken}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const timelineEvents = [
    { type: 'created', date: new Date(offer.createdAt), label: t('modal.tx.created') },
    ...(offer.viewLog || []).map(v => ({ type: 'viewed', date: new Date(v.timestamp), label: t('modal.tx.viewed') })),
  ];

  if (isSold) {
    timelineEvents.push({ type: 'sold', date: new Date(), label: t('modal.tx.finalized') }); 
  } else if (offer.expiresAt) {
    timelineEvents.push({ type: 'expiry', date: new Date(offer.expiresAt), label: t('modal.tx.expiry') });
  }

  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{offer.clientName}</h2>
              {isSold && <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">{t('modal.tx.sold')}</span>}
              {isExpired && <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200">{t('modal.tx.expired')}</span>}
              {isActive && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 flex items-center"><Clock className="w-3 h-3 mr-1" /> {t('modal.tx.active')}</span>}
            </div>
            <p className="text-sm text-slate-500 font-mono">Transaction ID: {offer.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            <div className="lg:w-5/12 p-8 bg-slate-50 border-r border-slate-100 flex flex-col">
               <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 mb-6 relative group max-h-[400px]">
                  <img src={stone.imageUrl} alt={stone.typology.name} className="w-full h-full object-cover" />
               </div>
               <div className="space-y-6 flex-1">
                 <div>
                   <h3 className="font-bold text-slate-900 text-xl">{stone.typology.name}</h3>
                   <div className="flex items-center text-sm text-slate-500 mt-2">
                     <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                     {stone.typology.origin}
                   </div>
                 </div>
                 <div className="p-5 bg-white rounded-lg border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center font-medium"><ShieldCheck className="w-4 h-4 mr-2" /> {t('card.lot')} ID</span>
                      <span className="font-mono font-bold text-slate-700">{stone.lotId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center font-medium"><Layers className="w-4 h-4 mr-2" /> {t('client.dimensions')}</span>
                      <span className="font-mono font-medium">{stone.dimensions.width}x{stone.dimensions.height} {stone.dimensions.unit}</span>
                    </div>
                 </div>
                 {role === 'industry_admin' && seller && (
                   <div className="flex items-center p-4 bg-white rounded-lg border border-slate-200">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4 overflow-hidden">
                        {seller.avatarUrl ? <img src={seller.avatarUrl} className="w-full h-full object-cover"/> : <User className="w-6 h-6 text-slate-400"/>}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">{t('dash.table.seller')}</p>
                        <p className="text-base font-bold text-slate-900">{seller.name}</p>
                      </div>
                   </div>
                 )}
               </div>
            </div>

            <div className="flex-1 p-8 space-y-8 lg:overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('modal.tx.unit_price')}</p>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(offer.finalPrice)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('modal.tx.qty')}</p>
                  <p className="text-3xl font-bold text-slate-900">{offer.quantityOffered} <span className="text-sm font-medium text-slate-500">{t(`unit.${stone.quantity.unit}`)}</span></p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                <div className="p-8 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wide">{t('modal.tx.total_val')}</span>
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-5xl font-bold tracking-tight mb-2">
                    {formatCurrency(totalValue)}
                  </div>
                </div>
                {!isExpired && (
                   <div className="bg-slate-800 px-8 py-5 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-slate-300 text-sm font-medium flex items-center">
                           {React.createElement(profitIcon, { className: "w-5 h-5 mr-2 text-emerald-400" })} 
                           {profitLabel}
                         </span>
                         <span className="text-emerald-400 font-bold text-xl">{formatCurrency(profitValue)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                        <div 
                           className="bg-emerald-500 h-2 rounded-full" 
                           style={{ width: `${Math.min(marginPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-slate-500 font-medium uppercase">{t('modal.tx.margin')}</span>
                        <span className="text-xs text-emerald-500 font-mono font-bold">{marginPercent.toFixed(1)}%</span>
                      </div>
                   </div>
                )}
              </div>

              <div className="space-y-5 pt-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center border-b border-slate-100 pb-2">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" /> {t('modal.tx.timeline')}
                </h4>
                <div className="relative border-l-2 border-slate-100 pl-8 ml-3 space-y-8 py-2">
                  {timelineEvents.map((event, index) => {
                    let colorClass = 'bg-slate-100 border-slate-300';
                    let textClass = 'text-slate-900';
                    let Icon = null;
                    if (event.type === 'created') {
                      colorClass = 'bg-blue-100 border-blue-500';
                    } else if (event.type === 'viewed') {
                      colorClass = 'bg-indigo-100 border-indigo-500';
                      textClass = 'text-indigo-900';
                      Icon = Eye;
                    } else if (event.type === 'sold') {
                      colorClass = 'bg-emerald-100 border-emerald-500';
                      textClass = 'text-emerald-700';
                    } else if (event.type === 'expiry') {
                       const isFuture = event.date > new Date();
                       colorClass = isFuture ? 'bg-slate-50 border-slate-200' : 'bg-amber-100 border-amber-500';
                       textClass = isFuture ? 'text-slate-400' : 'text-amber-700';
                    }
                    return (
                      <div key={index} className="relative group">
                        <div className={`absolute -left-[39px] top-1.5 w-5 h-5 rounded-full border-2 box-content ${colorClass} transition-colors bg-clip-padding`}></div>
                        <div className="flex justify-between items-start">
                           <div>
                             <p className={`text-base font-bold ${textClass} flex items-center`}>
                               {Icon && <Icon className="w-4 h-4 mr-2" />}
                               {event.label}
                             </p>
                             <p className="text-sm text-slate-500 mt-1">
                               {event.type === 'viewed' || event.type === 'created' 
                                  ? formatDateTime(event.date) 
                                  : formatDate(event.date, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                             </p>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
           <button 
             onClick={handleCopyLink}
             className="flex items-center px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
           >
             <Copy className="w-4 h-4 mr-2" />
             {t('modal.tx.copy')}
           </button>
           <a 
              href={`#${offer.clientViewToken}`} 
              className="flex items-center px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
           >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('modal.tx.open')}
           </a>
           {!isSold && !isExpired && (
             <>
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                <button 
                  onClick={() => onCancelLink?.(offer)}
                  className="flex items-center px-5 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm font-bold hover:bg-rose-100 hover:border-rose-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('modal.tx.cancel')}
                </button>
                <button 
                  onClick={() => onFinalizeSale?.(offer)}
                  className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                >
                  <BadgeCheck className="w-5 h-5 mr-2" />
                  {t('modal.tx.finalize')}
                </button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};
