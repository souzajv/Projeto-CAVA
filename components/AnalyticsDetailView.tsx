
import React, { useState, useMemo } from 'react';
import { OfferLink, StoneItem, Seller, SalesDelegation, UserRole } from '../types';
import { Search, Link as LinkIcon, DollarSign, Calendar, TrendingUp, Download, AlertTriangle } from 'lucide-react';
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

  // Filtering Logic: Only applies search and dates. 
  // Status filtering is done by parent to ensure 'Sales' tab only gets 'sold' items.
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemDate = new Date(item.offer.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        if (itemDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 
        if (itemDate > end) return false;
      }
      const searchLower = searchTerm.toLowerCase();
      return (
        item.offer.clientName.toLowerCase().includes(searchLower) ||
        (item.stone?.typology.name || '').toLowerCase().includes(searchLower) ||
        (item.stone?.lotId || '').toLowerCase().includes(searchLower) ||
        (item.seller?.name || '').toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm, startDate, endDate]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const revenue = item.offer.finalPrice * item.offer.quantityOffered;
      let cost = 0;
      if (role === 'industry_admin') {
        cost = (item.stone?.baseCost || 0) * item.offer.quantityOffered;
      } else {
        cost = (item.delegation?.agreedMinPrice || 0) * item.offer.quantityOffered;
      }
      return {
        revenue: acc.revenue + revenue,
        profit: acc.profit + (revenue - cost),
        count: acc.count + 1,
        units: acc.units + item.offer.quantityOffered
      };
    }, { revenue: 0, profit: 0, count: 0, units: 0 });
  }, [filteredData, role]);

  const handleExport = () => {
      alert(`Exporting ${filteredData.length} rows to CSV... (Simulation)`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-4xl font-serif text-[#121212] tracking-tight mb-2">{title}</h1>
           <p className="text-slate-500 font-light">{t('analytics.desc')}</p>
        </div>
        
        <button onClick={handleExport} className="flex items-center px-6 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C2410C] transition-all shadow-lg">
           <Download className="w-4 h-4 mr-2" />
           {t('analytics.export')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="p-8 bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
               {mode === 'pipeline' ? t('dash.kpi.potential_revenue') : t('dash.kpi.revenue')}
            </p>
            <p className="text-3xl font-serif text-[#121212]">{formatCurrency(totals.revenue)}</p>
         </div>
         {mode === 'profit' && (
           <div className="p-8 bg-[#121212] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C2410C]" />
              <p className="text-[10px] font-bold text-[#C2410C] uppercase tracking-[0.2em] mb-4">{t('dash.kpi.profit')}</p>
              <p className="text-3xl font-serif text-white">{formatCurrency(totals.profit)}</p>
           </div>
         )}
         <div className="p-8 bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{t('dash.kpi.transactions')}</p>
            <p className="text-3xl font-serif text-[#121212]">{totals.count}</p>
         </div>
         <div className="p-8 bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{t('dash.kpi.volume')}</p>
            <p className="text-3xl font-serif text-[#121212]">{totals.units} <span className="text-sm font-sans font-bold text-slate-400 tracking-normal">{t('dash.kpi.units')}</span></p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
        
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 bg-[#FAFAFA]">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#C2410C] transition-colors" />
              <input 
                type="text"
                placeholder={t('common.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 py-2 bg-transparent border-b border-slate-300 text-sm focus:border-[#C2410C] outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
                 <input 
                   type="date"
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="bg-white border border-slate-200 text-[10px] uppercase font-bold px-3 py-2 rounded-sm outline-none focus:border-[#C2410C] transition-colors"
                 />
                 <span className="text-slate-300">-</span>
                 <input 
                   type="date"
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="bg-white border border-slate-200 text-[10px] uppercase font-bold px-3 py-2 rounded-sm outline-none focus:border-[#C2410C] transition-colors"
                 />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100 bg-[#FAFAFA]">
              <tr>
                <th className="px-8 py-6">{t('dash.table.created')}</th>
                <th className="px-8 py-6">{t('dash.table.client')}</th>
                <th className="px-8 py-6">{t('dash.table.stone')}</th>
                {role === 'industry_admin' && <th className="px-8 py-6">{t('dash.table.seller')}</th>}
                <th className="px-8 py-6 text-right">{t('dash.table.value')}</th>
                {mode === 'profit' && (
                   <>
                     <th className="px-8 py-6 text-right text-slate-300">Base</th>
                     <th className="px-8 py-6 text-right text-emerald-600">{t('dash.kpi.profit')}</th>
                   </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center text-slate-400 font-serif italic">
                    {t('inv.no_results')}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const revenue = item.offer.finalPrice * item.offer.quantityOffered;
                  let costBasis = 0;
                  if (role === 'industry_admin') {
                    costBasis = (item.stone?.baseCost || 0) * item.offer.quantityOffered;
                  } else {
                    costBasis = (item.delegation?.agreedMinPrice || 0) * item.offer.quantityOffered;
                  }
                  const profit = revenue - costBasis;

                  return (
                    <tr 
                      key={item.offer.id} 
                      onClick={() => onTransactionClick?.(item)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-8 py-6 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {formatDate(item.offer.createdAt)}
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="font-bold text-[#121212] text-sm group-hover:text-[#C2410C] transition-colors">{item.offer.clientName}</div>
                      </td>

                      <td className="px-8 py-6">
                        {item.stone ? (
                          <>
                            <div className="font-serif text-lg text-[#121212]">{item.stone.typology.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {item.stone.lotId} • {item.offer.quantityOffered} {t(`unit.${item.stone.quantity.unit}`)}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center text-rose-500 text-xs font-bold uppercase tracking-widest">
                             <AlertTriangle className="w-4 h-4 mr-1" /> Unknown Stone
                          </div>
                        )}
                      </td>

                      {role === 'industry_admin' && (
                        <td className="px-8 py-6 text-sm font-medium text-slate-600">
                          {item.seller ? item.seller.name : t('common.direct_sale')}
                        </td>
                      )}

                      <td className="px-8 py-6 text-right">
                        <span className="font-serif text-lg text-[#121212] group-hover:text-[#C2410C] transition-colors">{formatCurrency(revenue)}</span>
                      </td>

                      {mode === 'profit' && (
                        <>
                          <td className="px-8 py-6 text-right text-slate-400 text-sm font-medium">
                             {formatCurrency(costBasis)}
                          </td>
                          <td className="px-8 py-6 text-right font-bold text-emerald-600">
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
