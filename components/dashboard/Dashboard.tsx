
import React, { useState, useMemo, useEffect } from 'react';
import { OfferLink, Seller, StoneItem, SalesDelegation, UserRole } from '../../types';
import { BarChart3, Link as LinkIcon, Users, ExternalLink, CheckSquare, BadgeCheck, Trash2, Calendar, X, ArrowUpRight, AlertCircle, Check, XCircle } from 'lucide-react';
import { PageView } from '../layout/Sidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, useSpring, useTransform } from 'framer-motion';
import { StatusBadge } from '../ui/Badge';

function NumberTicker({ value }: { value: number }) {
  const { formatCurrency } = useLanguage();
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => formatCurrency(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

interface DashboardProps {
  role: UserRole;
  kpi: {
    pipelineRevenue: number;
    soldRevenue: number;
    totalProfit: number;
    reservedLinks: number;
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
  onViewClientPage?: (token: string) => void;
  onApproveReservation?: (offer: OfferLink) => void;
  onRejectReservation?: (offer: OfferLink) => void;
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
  onSelectTransaction,
  onViewClientPage,
  onApproveReservation,
  onRejectReservation
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pending Reservations Logic
  const pendingReservations = useMemo(() => {
    return offers.filter(item => item.offer.status === 'reservation_pending');
  }, [offers]);

  const filteredOffers = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return offers.filter(item => {
      const itemDate = new Date(item.offer.createdAt);

      if (dateFilter === 'today') return itemDate >= startOfDay;

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
      if (a.offer.status === b.offer.status) return new Date(b.offer.createdAt).getTime() - new Date(a.offer.createdAt).getTime();
      return a.offer.status === 'active' ? -1 : 1;
    });
  }, [filteredOffers]);

  const clearCustomDates = () => {
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const FilterButton = ({ type, labelKey }: { type: DateFilterType, labelKey: string }) => (
    <button
      onClick={() => setDateFilter(type)}
      className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all border ${dateFilter === type
        ? 'bg-[#121212] text-white border-[#121212]'
        : 'bg-transparent text-slate-400 hover:text-[#121212] border-slate-200'
        }`}
    >
      {t(labelKey)}
    </button>
  );

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-5xl font-serif text-[#121212] tracking-tight mb-3">{role === 'industry_admin' ? t('dash.title_admin') : t('dash.title_seller')}</h2>
          <p className="text-slate-500 font-light text-lg max-w-2xl">
            {role === 'industry_admin' ? t('dash.subtitle_admin') : t('dash.subtitle_seller')}
          </p>
        </div>

        {role === 'industry_admin' && sellers && (
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-sm border border-slate-200 shadow-sm hover:border-[#121212] transition-colors group">
            <Users className="w-4 h-4 text-slate-400 group-hover:text-[#121212]" />
            <select
              value={selectedSellerId || 'all'}
              onChange={(e) => onFilterSeller?.(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer pr-8 outline-none uppercase tracking-wide"
            >
              <option value="all">{t('dash.filter.all_sellers')}</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* PENDING APPROVALS SECTION (Admin Only) */}
      {role === 'industry_admin' && pendingReservations.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-sm p-6 shadow-sm animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-900 uppercase tracking-widest text-sm">{t('dash.pending_reservations') || 'Solicitações de reserva pendentes'} ({pendingReservations.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingReservations.map(item => (
              <div key={item.offer.id} className="bg-white border border-purple-100 p-4 shadow-sm flex flex-col justify-between rounded-sm">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-sm uppercase">{t('dash.reservation_request') || 'Solicitação'}</span>
                    <span className="text-xs text-slate-400 font-mono">{formatDate(item.offer.createdAt)}</span>
                  </div>
                  <h4 className="font-bold text-[#121212]">{item.offer.clientName}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.seller?.name} • {item.stone.typology.name} ({item.stone.lotId})</p>
                  <p className="text-lg font-serif mt-2">{item.offer.quantityOffered} {item.stone.quantity.unit}</p>
                </div>

                <div className="flex gap-2 mt-auto border-t border-slate-50 pt-3">
                  <button
                    onClick={() => onRejectReservation?.(item.offer)}
                    className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors uppercase tracking-wider flex items-center justify-center"
                  >
                    <XCircle className="w-3 h-3 mr-1" /> {t('actions.reject') || 'Rejeitar'}
                  </button>
                  <button
                    onClick={() => onApproveReservation?.(item.offer)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-colors uppercase tracking-wider flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 mr-1" /> {t('actions.approve') || 'Aprovar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards - Editorial Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pipeline Card */}
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onNavigate?.('pipeline')}
          className="bg-white p-10 rounded-sm border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-left group relative overflow-hidden flex flex-col justify-between min-h-[240px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <LinkIcon className="w-32 h-32 rotate-12" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="kpi-dot w-2 h-2 bg-blue-500" />
                {t('dash.kpi.pipeline')}
              </p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                {t('dash.kpi.reserved_links')}: {kpi.reservedLinks}
              </span>
            </div>
            <h3 className="text-5xl font-serif text-[#121212]">
              <NumberTicker value={kpi.pipelineRevenue} />
            </h3>
          </div>
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors mt-8">
            <span>{t('dash.kpi.pipeline_desc')}</span>
            <ArrowUpRight className="w-3 h-3 ml-2" />
          </div>
        </motion.button>

        {/* Sales Card */}
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onNavigate?.('sales')}
          className="bg-white p-10 rounded-sm border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-left group relative overflow-hidden flex flex-col justify-between min-h-[240px]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckSquare className="w-32 h-32 rotate-12" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="kpi-dot w-2 h-2 bg-emerald-500" />
              {t('dash.kpi.sold')}
            </p>
            <h3 className="text-5xl font-serif text-[#121212]">
              <NumberTicker value={kpi.soldRevenue} />
            </h3>
          </div>
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors mt-8">
            <span>{t('dash.kpi.sold_desc')}</span>
            <ArrowUpRight className="w-3 h-3 ml-2" />
          </div>
        </motion.button>

        {/* Profit Card (Obsidian) */}
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onNavigate?.('financials')}
          className="bg-[#121212] p-10 rounded-sm shadow-2xl text-left group relative overflow-hidden flex flex-col justify-between min-h-[240px]"
        >
          <div className="absolute -right-8 -bottom-8 opacity-20">
            <BarChart3 className="w-48 h-48 text-white rotate-12" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#C2410C] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <span className="kpi-dot w-2 h-2 bg-[#C2410C] animate-pulse" />
              {kpi.labelProfit}
            </p>
            <h3 className="text-5xl font-serif text-white">
              <NumberTicker value={kpi.totalProfit} />
            </h3>
          </div>
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-white/40 mt-8">
            <span>{t('dash.kpi.profit_desc')}</span>
          </div>
        </motion.button>
      </div>

      {/* Transactions Table */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-4">
          <h3 className="font-serif text-2xl text-[#121212]">{t('dash.recent_transactions')}</h3>

          <div className="flex flex-wrap items-center gap-2">
            {dateFilter === 'custom' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="flex items-center gap-2 mr-2 overflow-hidden"
              >
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="bg-white border border-slate-200 text-[10px] uppercase font-bold px-2 py-1.5 rounded-sm outline-none" />
                <span className="text-slate-300">-</span>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="bg-white border border-slate-200 text-[10px] uppercase font-bold px-2 py-1.5 rounded-sm outline-none" />
                <button onClick={clearCustomDates} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
            <FilterButton type="all" labelKey="dash.filter.all" />
            <FilterButton type="week" labelKey="dash.filter.week" />
            <FilterButton type="month" labelKey="dash.filter.month" />
            <FilterButton type="custom" labelKey="dash.filter.custom" />
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAFAFA] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-8 py-6 pl-10 font-medium">{t('dash.table.status')}</th>
                <th className="px-8 py-6 font-medium">{t('dash.table.stone')}</th>
                <th className="px-8 py-6 font-medium">{t('dash.table.client')}</th>
                <th className="px-8 py-6 text-right font-medium">{t('dash.table.value')}</th>
                <th className="px-8 py-6 text-center font-medium">{t('dash.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOffers.map((transaction, i) => {
                const { offer, stone } = transaction;
                const total = offer.finalPrice * offer.quantityOffered;
                const isSold = offer.status === 'sold';
                const isExpired = offer.status === 'expired';

                return (
                  <motion.tr
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelectTransaction?.(transaction)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-6 pl-10">
                      <StatusBadge status={offer.status} />
                    </td>

                    <td className="px-8 py-6">
                      <div className="font-serif text-xl text-[#121212] mb-1">{stone.typology.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stone.lotId}</div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="text-[#121212] font-bold text-sm tracking-wide">{offer.clientName}</div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">{formatDate(offer.createdAt)}</div>
                    </td>

                    <td className="px-8 py-6 text-right font-serif text-lg font-medium text-[#121212]">
                      {formatCurrency(total)}
                    </td>

                    <td className="px-8 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-6">
                        {!isSold && !isExpired && (
                          <>
                            <button onClick={() => onFinalizeSale?.(offer)} className="text-slate-300 hover:text-emerald-600 transition-colors" title="Finalize Sale"><BadgeCheck className="w-5 h-5" /></button>
                            <button onClick={() => onCancelLink?.(offer)} className="text-slate-300 hover:text-rose-500 transition-colors" title="Cancel Link"><Trash2 className="w-5 h-5" /></button>
                          </>
                        )}
                        <button onClick={() => onViewClientPage?.(offer.clientViewToken)} className="text-slate-300 hover:text-[#C2410C] transition-colors" title="View Page">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
