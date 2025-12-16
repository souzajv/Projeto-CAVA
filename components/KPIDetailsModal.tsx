import React, { useState, useMemo } from 'react';
import { OfferLink, StoneItem, Seller, SalesDelegation, UserRole } from '../types';
import { X, Search, ArrowUpRight, DollarSign, Calendar, User, TrendingUp, Filter } from 'lucide-react';

export type KPIMode = 'pipeline' | 'sales' | 'profit';

interface EnrichedOffer {
  offer: OfferLink;
  stone: StoneItem;
  seller?: Seller;
  delegation?: SalesDelegation;
}

interface KPIDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: KPIMode;
  data: EnrichedOffer[];
  role: UserRole;
}

export const KPIDetailsModal: React.FC<KPIDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  mode, 
  data, 
  role 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

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
        end.setHours(23, 59, 59, 999); // Include the entire end day
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

  // Calculate Totals for Footer
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
        profit: acc.profit + profit
      };
    }, { revenue: 0, profit: 0 });
  }, [filteredData, role]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Increased max-width to 7xl for a wider view */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {mode === 'profit' && <TrendingUp className="w-6 h-6 text-emerald-400" />}
              {mode === 'pipeline' && <ArrowUpRight className="w-6 h-6 text-blue-400" />}
              {mode === 'sales' && <DollarSign className="w-6 h-6 text-emerald-400" />}
              {title}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Showing {filteredData.length} of {data.length} records
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder="Search Client, Stone, Lot or Seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all shadow-sm"
                autoFocus
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
                   title="Start Date"
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
                   title="End Date"
                 />
               </div>
            </div>

            {/* Clear Filters Button (Only shows if filters active) */}
            {(searchTerm || startDate || endDate) && (
              <button 
                onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline px-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Client / Details</th>
                <th className="px-6 py-4 font-bold tracking-wider">Stone Info</th>
                {role === 'industry_admin' && <th className="px-6 py-4 font-bold tracking-wider">Seller</th>}
                <th className="px-6 py-4 font-bold tracking-wider text-right">Revenue</th>
                {mode === 'profit' && (
                   <>
                     <th className="px-6 py-4 font-bold tracking-wider text-right text-slate-400">Cost Basis</th>
                     <th className="px-6 py-4 font-bold tracking-wider text-right text-emerald-700">Net Profit</th>
                   </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'profit' ? 7 : 5} className="px-6 py-20 text-center flex flex-col items-center justify-center text-slate-400 italic w-full">
                    <Filter className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">Try adjusting your search or date filters.</p>
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
                    <tr key={item.offer.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {formatDate(item.offer.createdAt)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{item.offer.clientName}</div>
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
                           <span className="font-medium">{item.offer.quantityOffered} {item.stone.quantity.unit}</span>
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
                              Direct Sale
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

        {/* Footer Summary */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-4 sm:gap-12 shrink-0 shadow-inner">
           <div className="text-right">
             <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Revenue</span>
             <span className="block text-2xl font-bold text-slate-900">{formatCurrency(totals.revenue)}</span>
           </div>
           {mode === 'profit' && (
             <div className="text-right pl-8 border-l border-slate-200">
                <span className="block text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total Net Profit</span>
                <span className="block text-2xl font-bold text-emerald-600">{formatCurrency(totals.profit)}</span>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};