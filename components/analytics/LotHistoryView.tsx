
import React, { useState, useMemo } from 'react';
import { StoneItem, OfferLink, SalesDelegation, Seller } from '../../types';
import { Search, Archive, Package, Filter, Calendar, TrendingUp, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LotHistoryViewProps {
  stones: StoneItem[];
  offers: OfferLink[];
  delegations: SalesDelegation[];
  sellers: Seller[];
  onSelectLot: (stone: StoneItem) => void;
}

export const LotHistoryView: React.FC<LotHistoryViewProps> = ({
  stones,
  offers,
  delegations,
  sellers,
  onSelectLot
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Lotes que estão 100% vendidos
  const historyStones = useMemo(() => {
    return stones.filter(s => s.quantity.sold >= s.quantity.total);
  }, [stones]);

  const filteredStones = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return historyStones.filter(s =>
      s.typology.name.toLowerCase().includes(term) ||
      s.lotId.toLowerCase().includes(term)
    );
  }, [historyStones, searchTerm]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl sm:text-4xl font-serif text-[#121212] tracking-tight mb-2 flex items-center">
          {t('nav.lot_history')}
        </h2>
        <p className="text-slate-500 font-light text-base sm:text-lg">{t('inv.history_subtitle')}</p>
      </div>

      {/* Stats Summary for History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        <div className="p-6 sm:p-7 lg:p-8 bg-white border border-slate-100 shadow-sm rounded-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{t('inv.status.sold_out')}</p>
          <p className="text-3xl sm:text-4xl font-serif text-[#121212]">{historyStones.length} <span className="text-sm font-sans text-slate-400 font-bold uppercase tracking-widest">{t('dash.kpi.units')}</span></p>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-[#FAFAFA]">
          <div className="relative group max-w-md">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#121212] transition-colors ml-1" />
            <input
              type="text"
              placeholder={t('inv.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 py-2 bg-transparent border-b border-slate-200 text-sm focus:border-[#121212] outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 px-4 pb-4 pt-2">
            {filteredStones.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="font-serif italic text-lg">{t('inv.history_empty')}</p>
              </div>
            ) : (
              filteredStones.map((stone) => {
                const stoneOffers = offers.filter(o => o.stoneId === stone.id && o.status === 'sold');
                const totalRevenue = stoneOffers.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0);
                const totalProfit = totalRevenue - (stone.baseCost * stone.quantity.total);

                return (
                  <div
                    key={stone.id}
                    onClick={() => onSelectLot(stone)}
                    className="rounded-md border border-slate-200 bg-white shadow-sm p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-slate-100 shrink-0 border border-slate-100 overflow-hidden rounded-sm">
                        <img src={stone.imageUrl} className="w-full h-full object-cover grayscale opacity-70" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-[#121212] text-base truncate">{stone.typology.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stone.lotId}</div>
                        <div className="text-sm text-slate-600">{stone.quantity.total} {t(`unit.${stone.quantity.unit}`)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold uppercase tracking-wider rounded-sm">
                        {t('card.reserved')}: {stone.quantity.reserved}
                      </span>
                      <span className="font-serif text-lg text-[#121212]">{formatCurrency(totalRevenue)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{t('dash.kpi.profit')}</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(totalProfit)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            {filteredStones.length === 0 ? (
              <div className="py-32 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="font-serif italic text-lg">{t('inv.history_empty')}</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100 bg-[#FAFAFA]">
                  <tr>
                    <th className="px-8 py-6">{t('dash.table.stone')}</th>
                    <th className="px-8 py-6 text-center">{t('dash.kpi.volume')}</th>
                    <th className="px-8 py-6 text-center">{t('card.reserved')}</th>
                    <th className="px-8 py-6 text-right">{t('dash.kpi.revenue')}</th>
                    <th className="px-8 py-6 text-right">{t('dash.kpi.profit')}</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStones.map((stone) => {
                    const stoneOffers = offers.filter(o => o.stoneId === stone.id && o.status === 'sold');
                    const totalRevenue = stoneOffers.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0);
                    const totalProfit = totalRevenue - (stone.baseCost * stone.quantity.total);

                    return (
                      <tr
                        key={stone.id}
                        onClick={() => onSelectLot(stone)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 shrink-0 border border-slate-100 overflow-hidden">
                              <img src={stone.imageUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <div>
                              <div className="font-bold text-[#121212] text-sm group-hover:text-[#C2410C] transition-colors">{stone.typology.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{stone.lotId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-sm font-medium text-slate-600">{stone.quantity.total} {t(`unit.${stone.quantity.unit}`)}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                            {stone.quantity.reserved}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="font-serif text-[#121212]">{formatCurrency(totalRevenue)}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="font-bold text-emerald-600">{formatCurrency(totalProfit)}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <TrendingUp className="w-4 h-4 text-slate-300 group-hover:text-[#C2410C] transition-colors inline-block" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
