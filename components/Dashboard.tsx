import React, { useState, useMemo } from 'react';
import { OfferLink, Seller, StoneItem, SalesDelegation, UserRole } from '../types';
import { DollarSign, BarChart3, Activity, Users, ExternalLink, CheckSquare, BadgeCheck, ChevronRight, Trash2, Calendar, Filter, X } from 'lucide-react';
import { PageView } from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  role: UserRole;
  kpi: {
    pipelineRevenue: number;
    soldRevenue: number;
    totalProfit: number;
    labelProfit: string;
  };
  offers: {
    offer: OfferLink;
    stone: StoneItem;
    seller?: Seller;
    delegation?: SalesDelegation;
  }[];
  sellers?: Seller[];
  selectedSellerId?: string;
  onFilterSeller?: (sellerId: string) => void;
  onFinalizeSale?: (offer: OfferLink) => void; 
  onCancelLink?: (offer: OfferLink) => void;
  onNavigate?: (page: PageView) => void;
  onSelectTransaction?: (transaction: any) => void;
}

type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export const Dashboard: React.FC<DashboardProps> = ({ 
  role, 
  kpi, 
  offers, 
  sellers, 
  selectedSellerId, 
  onFilterSeller,
  onFinalizeSale,
  onCancelLink,
  onNavigate,
  onSelectTransaction
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter Logic
  const filteredOffers = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return offers.filter(item => {
      const itemDate = new Date(item.offer.createdAt);

      if (dateFilter === 'today') {
        return itemDate >= startOfDay;
      }
      
      if (dateFilter === 'week') {
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return itemDate >= startOfWeek;
      }

      if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return itemDate >= startOfMonth;
      }

      if (dateFilter === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return itemDate >= startOfYear;
      }

      if (dateFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          if (itemDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
        return true;
      }

      return true;
    });
  }, [offers, dateFilter, customStartDate, customEndDate]);

  const sortedOffers = useMemo(() => {
    return [...filteredOffers].sort((a, b) => {
      if (a.offer.status === b.offer.status) {
         return new Date(b.offer.createdAt).getTime() - new Date(a.offer.createdAt).getTime();
      }
      return a.offer.status === 'active' ? -1 : 1;
    });
  }, [filteredOffers]);

  const FilterButton = ({ type, labelKey }: { type: DateFilterType, labelKey: string }) => (
    <button
      onClick={() => setDateFilter(type)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        dateFilter === type 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
      }`}
    >
      {t(labelKey)}
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900 flex items-center">
             <BarChart3 className="w-6 h-6 mr-2 text-slate-700" />
             {role === 'industry_admin' ? t('dash.title_admin') : t('dash.title_seller')}
           </h2>
           <p className="text-sm text-slate-500 mt-1">
             {role === 'industry_admin' ? t('dash.subtitle_admin') : t('dash.subtitle_seller')}
           </p>
        </div>

        {role === 'industry_admin' && sellers && (
          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <Users className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={selectedSellerId || 'all'}
              onChange={(e) => onFilterSeller?.(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer pr-8"
            >
              <option value="all">{t('dash.filter.all_sellers')}</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate?.('pipeline')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{t('dash.kpi.pipeline')}</p>
               <h3 className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(kpi.pipelineRevenue)}</h3>
             </div>
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
               <Activity className="w-5 h-5" />
             </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
             <span>{t('dash.kpi.pipeline_desc')}</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.('sales')}
          className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-md hover:from-emerald-100/50 hover:to-white transition-all text-left group relative"
        >
          <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">{t('dash.kpi.sold')}</p>
               <h3 className="text-3xl font-bold text-emerald-800 mt-2">{formatCurrency(kpi.soldRevenue)}</h3>
             </div>
             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 group-hover:bg-emerald-200 transition-colors">
               <DollarSign className="w-5 h-5" />
             </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-700 font-medium">
             <CheckSquare className="w-3 h-3 mr-1" />
             <span>{t('dash.kpi.sold_desc')}</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate?.('financials')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-left group relative"
        >
           <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex justify-between items-start">
             <div>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-purple-600 transition-colors">{kpi.labelProfit}</p>
               <h3 className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(kpi.totalProfit)}</h3>
             </div>
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
               <BarChart3 className="w-5 h-5" />
             </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
             <span>{t('dash.kpi.profit_desc')}</span>
          </div>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-semibold text-slate-900">{t('dash.recent_transactions')}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400 mr-1 flex items-center">
                 <Filter className="w-3 h-3 mr-1" /> {t('dash.filter.period')}
              </span>
              <FilterButton type="all" labelKey="dash.filter.all" />
              <FilterButton type="today" labelKey="dash.filter.today" />
              <FilterButton type="week" labelKey="dash.filter.week" />
              <FilterButton type="month" labelKey="dash.filter.month" />
              <FilterButton type="year" labelKey="dash.filter.year" />
              <FilterButton type="custom" labelKey="dash.filter.custom" />
            </div>
          </div>

          {dateFilter === 'custom' && (
             <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 w-fit animate-in fade-in slide-in-from-top-1">
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 <input 
                   type="date" 
                   value={customStartDate}
                   onChange={e => setCustomStartDate(e.target.value)}
                   className="text-xs border-none bg-transparent focus:ring-0 text-slate-600 font-medium p-0"
                 />
               </div>
               <span className="text-slate-300">-</span>
               <div className="flex items-center gap-2">
                 <input 
                   type="date" 
                   value={customEndDate}
                   onChange={e => setCustomEndDate(e.target.value)}
                   className="text-xs border-none bg-transparent focus:ring-0 text-slate-600 font-medium p-0"
                 />
               </div>
               <button 
                  onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                  className="ml-2 text-slate-400 hover:text-slate-600"
               >
                 <X className="w-3 h-3" />
               </button>
             </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-medium">{t('dash.table.status')}</th>
                <th className="px-6 py-3 font-medium">{t('dash.table.created')}</th>
                <th className="px-6 py-3 font-medium">{t('dash.table.stone')}</th>
                {role === 'industry_admin' && <th className="px-6 py-3 font-medium">{t('dash.table.seller')}</th>}
                <th className="px-6 py-3 font-medium">{t('dash.table.client')}</th>
                <th className="px-6 py-3 font-medium text-right">{t('dash.table.value')}</th>
                <th className="px-6 py-3 font-medium text-center">{t('dash.table.expires')}</th>
                <th className="px-6 py-3 font-medium text-center">{t('dash.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOffers.length === 0 ? (
                 <tr>
                   <td colSpan={9} className="px-6 py-12 text-center text-slate-400 italic">
                     <div className="flex flex-col items-center">
                       <Calendar className="w-8 h-8 mb-2 opacity-20" />
                       <p>{t('dash.no_tx')}</p>
                     </div>
                   </td>
                 </tr>
              ) : (
                sortedOffers.map((transaction) => {
                  const { offer, stone, seller } = transaction;
                  const total = offer.finalPrice * offer.quantityOffered;
                  const isSold = offer.status === 'sold';
                  const isExpired = offer.status === 'expired';

                  return (
                    <tr 
                      key={offer.id} 
                      onClick={() => onSelectTransaction?.(transaction)}
                      className={`transition-colors cursor-pointer group ${isSold || isExpired ? 'bg-slate-50/50 hover:bg-slate-100' : 'hover:bg-blue-50/30'}`}
                    >
                      <td className="px-6 py-4">
                        {isSold ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {t('dash.status.sold')}
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {t('dash.status.expired')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {t('dash.status.active')}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                         {formatDate(offer.createdAt, { day: '2-digit', month: '2-digit' })}
                      </td>

                      <td className="px-6 py-4">
                        <div className={`font-medium ${isSold || isExpired ? 'text-slate-500' : 'text-slate-900'}`}>{stone.typology.name}</div>
                        <div className="text-xs text-slate-500">Lot: {stone.lotId}</div>
                      </td>
                      
                      {role === 'industry_admin' && (
                        <td className="px-6 py-4">
                          {seller ? (
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden mr-2 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-300">
                                {seller.avatarUrl ? (
                                  <img src={seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  seller.name.charAt(0)
                                )}
                              </div>
                              <span className="text-slate-700">{seller.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded">{t('common.direct_sale')}</span>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <div className="text-slate-900">{offer.clientName}</div>
                        <div className="text-xs text-slate-500">{offer.quantityOffered} {stone.quantity.unit}</div>
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {formatCurrency(total)}
                      </td>

                      <td className="px-6 py-4 text-center text-slate-500 text-xs">
                         {isSold || isExpired ? '-' : formatDate(offer.expiresAt || '')}
                      </td>

                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                         <div className="flex items-center justify-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           {!isSold && !isExpired && (
                             <>
                               <button
                                 onClick={() => onFinalizeSale?.(offer)}
                                 className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                               >
                                 <BadgeCheck className="w-4 h-4" />
                               </button>
                               <div className="w-px h-4 bg-slate-200 mx-1"></div>
                               <button 
                                 onClick={() => onCancelLink?.(offer)}
                                 className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                               <div className="w-px h-4 bg-slate-200 mx-1"></div>
                             </>
                           )}
                           <a 
                             href={`#${offer.clientViewToken}`} 
                             className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                           >
                             <ExternalLink className="w-4 h-4" />
                           </a>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>{sortedOffers.length} {t('dash.records_found')}</span>
          {dateFilter !== 'all' && (
             <span>{t('dash.filter_by')} <span className="font-medium text-slate-900 capitalize">{t(`dash.filter.${dateFilter}`)}</span></span>
          )}
        </div>
      </div>
    </div>
  );
};