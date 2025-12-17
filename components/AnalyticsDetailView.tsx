import React, { useState, useMemo } from 'react';
import { OfferLink, StoneItem, Seller, SalesDelegation, UserRole } from '../types';
import { Search, ArrowUpRight, DollarSign, Calendar, TrendingUp, Filter, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type AnalyticsMode = 'pipeline' | 'sales' | 'profit';

interface EnrichedOffer {
  offer: OfferLink;
  stone: StoneItem;
  seller?: Seller;
  delegation?: SalesDelegation;
}

interface AnalyticsDetailViewProps {
  title: string;
  mode: AnalyticsMode;
  data: EnrichedOffer[];
  role: UserRole;
  onTransactionClick?: (item: EnrichedOffer) => void;
}

export const AnalyticsDetailView: React.FC<AnalyticsDetailViewProps> = ({ 
  title, 
  mode, 
  data, 
  role,
  onTransactionClick
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemDate = new Date(item.offer.createdAt);
      
      // Date Range Filter
      if (startDate) {
        const start = new Date(startDate);
        if (itemDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 
        if (itemDate > end) return false;
      }

      // Text Search Filter
      const searchLower = searchTerm.toLowerCase();
      return (
        item.offer.clientName.toLowerCase().includes(searchLower) ||
        item.stone.typology.name.toLowerCase().includes(searchLower) ||
        item.stone.lotId.toLowerCase().includes(searchLower) ||
        (item.seller?.name || '').toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm, startDate, endDate]);

  // Calculate Totals for Header Cards
  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const revenue = item.offer.finalPrice * item.offer.quantityOffered;
      
      let cost = 0;
      if (role === 'industry_admin') {
        cost = item.stone.baseCost * item.offer.quantityOffered;
      } else {
        cost = (item.delegation?.agreedMinPrice || 0) * item.offer.quantityOffered;
      }
      
      const profit = revenue - cost;

      return {
        revenue: acc.revenue + revenue,
        profit: acc.profit + profit,
        count: acc.count + 1,
        units: acc.units + item.offer.quantityOffered
      };
    }, { revenue: 0, profit: 0, count: 0, units: 0 });
  }, [filteredData, role]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className={`p-2 rounded-lg ${mode === 'profit' ? 'bg-emerald-100 text-emerald-600' : mode === 'pipeline' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {mode === 'profit' && <TrendingUp className="w-6 h-6" />}
                {mode === 'pipeline' && <ArrowUpRight className="w-6 h-6" />}
                {mode === 'sales' && <DollarSign className="w-6 h-6" />}
             </div>
             <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
           </div>
           <p className="text-slate-500">{t('analytics.desc')}</p>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
           <Download className="w-4 h-4 mr-2" />
           {t('analytics.export')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dash.kpi.revenue')}</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totals.revenue)}</p>
         </div>
         {mode === 'profit' && (
           <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm bg-emerald-50/30">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{t('dash.kpi.profit')}</p>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totals.profit)}</p>
           </div>
         )}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dash.kpi.transactions')}</p>
            <p className="text-2xl font-bold text-slate-900">{totals.count}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dash.kpi.volume')}</p>
            <p className="text-2xl font-bold text-slate-900">{totals.units} <span className="text-sm font-medium text-slate-500">{t('dash.kpi.units')}</span></p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder={t('common.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto">
               <div className="relative group flex-1 md:w-40">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                   <Calendar className="w-4 h-4" />
                 </div>
                 <input 
                   type="date"
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="w-full pl-10 pr-2 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
                 />
               </div>
               <span className="text-slate-400 font-medium">-</span>
               <div className="relative group flex-1 md:w-40">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                   <Calendar className="w-4 h-4" />
                 </div>
                 <input 
                   type="date"
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="w-full pl-10 pr-2 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-slate-900 outline-none shadow-sm"
                 />
               </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || startDate || endDate) && (
              <button 
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline px-2"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.created')}</th>
                <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.client')}</th>
                <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.stone')}</th>
                {role === 'industry_admin' && <th className="px-6 py-4 font-bold tracking-wider">{t('dash.table.seller')}</th>}
                <th className="px-6 py-4 font-bold tracking-wider text-right">{t('dash.table.value')}</th>
                {mode === 'profit' && (
                   <>
                     <th className="px-6 py-4 font-bold tracking-wider text-right text-slate-400">Base</th>
                     <th className="px-6 py-4 font-bold tracking-wider text-right text-emerald-700">{t('dash.kpi.profit')}</th>
                   </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'profit' ? 7 : 5} className="px-6 py-20 text-center flex flex-col items-center justify-center text-slate-400 italic w-full">
                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">{t('inv.no_results')}</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const revenue = item.offer.finalPrice * item.offer.quantityOffered;
                  
                  // Calculate specific metrics for row
                  let costBasis = 0;
                  if (role === 'industry_admin') {
                    costBasis = item.stone.baseCost * item.offer.quantityOffered;
                  } else {
                    costBasis = (item.delegation?.agreedMinPrice || 0) * item.offer.quantityOffered;
                  }
                  const profit = revenue - costBasis;

                  return (
                    <tr 
                      key={item.offer.id} 
                      onClick={() => onTransactionClick?.(item)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {formatDate(item.offer.createdAt)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">{item.offer.clientName}</div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">
                           ID: {item.offer.id.split('-').pop()}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{item.stone.typology.name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                           <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mr-2 font-mono text-slate-600">
                             {item.stone.lotId}
                           </span>
                           <span className="font-medium">{item.offer.quantityOffered} {t(`unit.${item.stone.quantity.unit}`)}</span>
                        </div>
                      </td>

                      {role === 'industry_admin' && (
                        <td className="px-6 py-4">
                          {item.seller ? (
                            <div className="flex items-center text-slate-700">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mr-2 text-xs font-bold text-slate-500">
                                {item.seller.name.charAt(0)}
                              </div>
                              {item.seller.name}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-medium">
                              {t('common.direct_sale')}
                            </span>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900 text-base">{formatCurrency(revenue)}</span>
                      </td>

                      {mode === 'profit' && (
                        <>
                          <td className="px-6 py-4 text-right text-slate-400 text-sm">
                             {formatCurrency(costBasis)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 bg-emerald-50/50 group-hover:bg-emerald-100/50 transition-colors">
                             {formatCurrency(profit)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};