
import React, { useMemo } from 'react';
import { OfferLink, StoneItem, Seller, UserRole, SalesDelegation, InterestLevel } from '../types';
import { X, Calendar, User, DollarSign, MapPin, ExternalLink, BadgeCheck, Clock, Eye, TrendingUp, Wallet, Flame, Snowflake, Activity, AlertTriangle, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PLATFORM_DOMAIN } from '../constants';

interface TransactionDetailsModalProps {
  transaction: {
    offer: OfferLink;
    stone: StoneItem;
    seller?: Seller;
    delegation?: SalesDelegation;
  };
  role: UserRole;
  onClose: () => void;
  onFinalizeSale?: (offer: OfferLink) => void;
  onCancelLink?: (offer: OfferLink) => void;
  onViewClientPage?: (token: string) => void;
  onRequestReservation?: (offer: OfferLink) => void;
  onApproveReservation?: (offer: OfferLink) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  transaction, 
  role, 
  onClose,
  onFinalizeSale,
  onCancelLink,
  onViewClientPage,
  onRequestReservation,
  onApproveReservation
}) => {
  const { t, formatCurrency, formatDateTime } = useLanguage();
  const { offer, stone, seller, delegation } = transaction;

  // Safeguard: If stone data is missing, render an error state or null to prevent crash
  if (!stone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={onClose}>
        <div className="bg-white rounded-sm shadow-2xl p-8 max-w-md w-full text-center relative border border-white/10">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-[#121212] transition-colors">
              <X className="w-6 h-6" />
           </button>
           <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
           </div>
           <h3 className="text-lg font-serif font-bold text-[#121212] mb-2">Data Unavailable</h3>
           <p className="text-slate-500 text-sm">The stone associated with this transaction could not be found. It may have been deleted.</p>
        </div>
      </div>
    );
  }

  const isSold = offer.status === 'sold';
  const isActive = offer.status === 'active';
  const totalValue = offer.finalPrice * offer.quantityOffered;

  const interestLevel = useMemo((): InterestLevel => {
    const views = offer.viewLog?.length || 0;
    const totalDurationMs = offer.viewLog?.reduce((acc, log) => acc + (log.durationMs || 0), 0) || 0;
    
    const lastViewTime = offer.viewLog?.length > 0 
      ? new Date(offer.viewLog[offer.viewLog.length - 1].timestamp).getTime()
      : 0;
    
    const hoursSinceLastView = lastViewTime ? (Date.now() - lastViewTime) / (1000 * 60 * 60) : 9999;

    let score = (views * 15) + (totalDurationMs / 1000); 
    
    if (hoursSinceLastView < 24) score *= 1.5;
    else if (hoursSinceLastView < 48) score *= 1.2;

    if (score > 120) return 'hot';
    if (score > 45) return 'warm';
    return 'cold';
  }, [offer.viewLog]);

  let costBasis = 0;
  let profitLabel = '';
  let profitIcon = TrendingUp;
  
  if (role === 'industry_admin') {
    costBasis = stone.baseCost * offer.quantityOffered;
    profitLabel = isSold ? t('dash.kpi.profit_admin') : t('modal.tx.est_profit');
  } else {
    costBasis = (delegation?.agreedMinPrice || 0) * offer.quantityOffered;
    profitLabel = isSold ? t('dash.kpi.profit_seller') : t('modal.tx.est_comm');
    profitIcon = Wallet;
  }
  
  const profitValue = totalValue - costBasis;
  const marginPercent = totalValue > 0 ? (profitValue / totalValue) * 100 : 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${PLATFORM_DOMAIN}/view/${offer.clientViewToken}`);
    alert('Link copied!');
  };

  const timelineEvents = [
    { type: 'created', date: new Date(offer.createdAt), label: t('modal.tx.created') },
    ...(offer.viewLog || []).map(v => ({ 
      type: 'viewed', 
      date: new Date(v.timestamp), 
      label: t('modal.tx.viewed'),
      duration: v.durationMs ? `${Math.round(v.durationMs/1000)}s` : null
    })),
  ];

  if (isSold) {
    timelineEvents.push({ type: 'sold', date: new Date(), label: t('modal.tx.finalized') }); 
  }

  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  const getInterestTag = () => {
    if (!isActive) return null;
    
    const styles = {
      cold: 'bg-slate-800/50 border-slate-700 text-slate-400',
      warm: 'bg-orange-900/30 border-orange-800 text-orange-400',
      hot: 'bg-rose-900/30 border-rose-800 text-rose-400 animate-pulse'
    };

    const icons = {
      cold: Snowflake,
      warm: Activity,
      hot: Flame
    };

    const Icon = icons[interestLevel];

    return (
      <span className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-widest flex items-center ml-3 rounded-sm ${styles[interestLevel]}`}>
         <Icon className="w-3 h-3 mr-1.5" />
         {t(`interest.level.${interestLevel}`)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-[#222] flex justify-between items-start bg-[#121212]">
          <div>
            <div className="flex items-center mb-2 flex-wrap gap-y-2">
              <h2 className="text-3xl font-serif text-white mr-4">{offer.clientName}</h2>
              {isSold && <span className="px-3 py-1 bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-sm">{t('modal.tx.sold')}</span>}
              {isActive && (
                <>
                  <span className="px-3 py-1 bg-blue-900/30 border border-blue-800 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center rounded-sm">
                    <Clock className="w-3 h-3 mr-1" /> {t('modal.tx.active')}
                  </span>
                  {getInterestTag()}
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">{t('modal.tx.id')}: {offer.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
          <div className="flex flex-col lg:flex-row h-full">
            <div className="lg:w-5/12 p-8 border-r border-slate-200 bg-white flex flex-col">
               <div className="aspect-square bg-slate-100 overflow-hidden mb-8 relative group">
                  <img src={stone.imageUrl} alt={stone.typology.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#121212]">
                     Lot {stone.lotId}
                  </div>
               </div>
               <div className="space-y-8 flex-1">
                 <div>
                   <h3 className="font-serif text-3xl text-[#121212] mb-2">{stone.typology.name}</h3>
                   <div className="flex items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                     <MapPin className="w-3 h-3 mr-2" /> {stone.typology.origin}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('client.dimensions')}</span>
                      <span className="font-mono text-sm text-[#121212]">{stone.dimensions.width}x{stone.dimensions.height} {stone.dimensions.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('card.lot')}</span>
                      <span className="font-mono text-sm text-[#121212]">{stone.lotId}</span>
                    </div>
                 </div>
               </div>
            </div>

            <div className="flex-1 p-10 space-y-12 bg-[#FAFAFA]">
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-slate-200 pb-8">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{t('modal.tx.unit_price')}</p>
                      <p className="text-4xl font-serif text-[#121212]">{formatCurrency(offer.finalPrice)}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{t('modal.tx.qty')}</p>
                      <p className="text-4xl font-serif text-[#121212]">{offer.quantityOffered} <span className="text-lg font-sans text-slate-400">{t(`unit.${stone.quantity.unit}`)}</span></p>
                   </div>
                </div>
                <div className="bg-[#121212] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <DollarSign className="w-32 h-32 rotate-12" />
                  </div>
                  <div className="relative z-10">
                     <p className="text-[10px] font-bold text-[#C2410C] uppercase tracking-[0.3em] mb-4">{t('modal.tx.total_val')}</p>
                     <div className="text-6xl font-serif tracking-tight mb-8">{formatCurrency(totalValue)}</div>
                     <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
                        <div>
                           <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                             {React.createElement(profitIcon, { className: "w-3 h-3 mr-2 text-[#C2410C]" })} {profitLabel}
                           </div>
                           <div className="text-2xl font-medium text-[#C2410C]">{formatCurrency(profitValue)}</div>
                        </div>
                        <div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('modal.tx.margin')}</div>
                           <div className="text-2xl font-mono">{marginPercent.toFixed(1)}%</div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-[#121212] uppercase tracking-[0.2em] flex items-center border-b border-slate-200 pb-4">
                  <Calendar className="w-3 h-3 mr-2" /> {t('modal.tx.timeline')}
                </h4>
                <div className="space-y-6 pl-2">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex gap-4 relative">
                      {index !== timelineEvents.length - 1 && (
                         <div className="absolute left-[5px] top-2 bottom-[-24px] w-px bg-slate-200" />
                      )}
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${event.type === 'created' ? 'bg-blue-500' : event.type === 'sold' ? 'bg-[#C2410C]' : 'bg-[#121212]'}`} />
                      <div>
                        <p className="text-sm font-bold text-[#121212] flex items-center">
                          {event.label}
                          {(event as any).duration && (
                            <span className="ml-3 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-sm">
                              {(event as any).duration}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">{formatDateTime(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-end gap-4 z-10">
           <button onClick={() => onViewClientPage?.(offer.clientViewToken)} className="px-6 py-3 bg-white border border-slate-200 text-[#121212] text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">
             {t('modal.tx.open')}
           </button>
           
           {!isSold && !offer.status.includes('expired') && (
             <>
                {/* RESERVE ACTIONS */}
                {isActive && role === 'seller' && onRequestReservation && (
                   <button onClick={() => onRequestReservation(offer)} className="px-6 py-3 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest hover:bg-purple-100 transition-colors flex items-center">
                      <Lock className="w-3 h-3 mr-2" /> Request Reserve
                   </button>
                )}
                
                {isActive && role === 'industry_admin' && onApproveReservation && (
                   <button onClick={() => onApproveReservation(offer)} className="px-6 py-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest hover:bg-amber-100 transition-colors flex items-center">
                      <Lock className="w-3 h-3 mr-2" /> Reserve Now
                   </button>
                )}

                <button onClick={() => onCancelLink?.(offer)} className="px-6 py-3 bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest hover:bg-rose-100 transition-colors">
                   {t('modal.tx.cancel')}
                </button>
                <button onClick={() => onFinalizeSale?.(offer)} className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C2410C] shadow-lg transition-all flex items-center">
                  <BadgeCheck className="w-4 h-4 mr-2" /> {t('modal.tx.finalize')}
                </button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};
