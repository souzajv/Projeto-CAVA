
import React, { useState, useMemo } from 'react';
import { OfferLink, StoneItem, Seller, InterestLevel, UserRole, SalesDelegation } from '../../types';
import { useInterestAnalytics } from '../../hooks/useInterestAnalytics';
import { Snowflake, Activity, Flame, Search, Info, Eye, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InterestThermometerViewProps {
  offers: OfferLink[];
  stones: StoneItem[];
  sellers: Seller[];
  delegations: SalesDelegation[];
  role: UserRole;
  onSelectTransaction: (data: any) => void;
  onViewClientPage: (token: string) => void;
}

export const InterestThermometerView: React.FC<InterestThermometerViewProps> = ({
  offers = [],
  stones = [],
  sellers = [],
  delegations = [],
  role,
  onSelectTransaction,
  onViewClientPage
}) => {
  const { t, formatDate } = useLanguage();
  const [activeKpi, setActiveKpi] = useState<InterestLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { analytics, stats } = useInterestAnalytics(offers);

  const formatDurationFriendly = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const filteredData = useMemo(() => {
    let base = analytics;

    if (activeKpi !== 'all') {
      base = base.filter(a => a.interestLevel === activeKpi);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      base = base.filter(a => {
        const stone = stones.find(s => s.id === a.offer.stoneId);
        return (
          a.offer.clientName.toLowerCase().includes(lower) ||
          stone?.typology.name.toLowerCase().includes(lower) ||
          stone?.lotId.toLowerCase().includes(lower)
        );
      });
    }

    return base;
  }, [analytics, activeKpi, searchTerm, stones]);

  const getPartnerLabel = (offer: OfferLink) => {
    if (!offer.delegationId) return t('common.direct_sale');

    const del = delegations.find(d => d.id === offer.delegationId);
    if (!del) return '---';

    const sel = sellers.find(s => s.id === del.sellerId);
    return sel ? sel.name : 'Partner Seller';
  };

  const KPICard = ({ level, count, label, description, icon: Icon, gradient }: any) => {
    const isActive = activeKpi === level;

    return (
      <div className="relative group flex-1">
        <button
          onClick={() => setActiveKpi(isActive ? 'all' : level)}
          className={`relative w-full p-6 rounded-sm transition-all duration-500 text-left overflow-hidden min-h-[12rem] flex flex-col justify-between border ${isActive
            ? 'border-transparent shadow-xl scale-[1.01] z-20'
            : 'bg-white border-slate-100 hover:border-[#121212] hover:shadow-lg z-10'
            }`}
        >
          {isActive && (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} animate-in fade-in duration-500`} />
          )}

          {!isActive && (
            <div className="absolute inset-0 bg-[#121212] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
          )}

          <div className="flex justify-between items-start relative z-10">
            <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#C2410C]'}`} />
            <span className={`text-4xl font-serif transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#121212] group-hover:text-white'}`}>
              {count}
            </span>
          </div>

          <div className="relative z-10 flex flex-col justify-end">
            <p className={`text-[11px] font-extrabold uppercase tracking-[0.22em] transition-colors duration-300 mb-2 ${isActive ? 'text-white/90' : 'text-slate-500 group-hover:text-[#C2410C]'}`}>
              {label}
            </p>

            {/* Explicação visível apenas no HOVER ou se o KPI estiver ATIVO */}
            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
              <div className="overflow-hidden">
                <p className={`text-[12px] leading-relaxed pt-3 font-semibold transition-all duration-500 ${isActive
                  ? 'text-white/95 opacity-100'
                  : 'text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-white/90'
                  }`}>
                  {description}
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-4xl font-serif text-[#121212] tracking-tight mb-2 flex items-center">
          {t('interest.title')}
        </h2>
        <p className="text-slate-500 font-light text-lg">{t('interest.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <KPICard
          level="cold"
          count={stats.cold}
          label={t('interest.level.cold')}
          description={t('interest.tooltip.cold')}
          icon={Snowflake}
          gradient="from-slate-700 to-slate-900"
        />
        <KPICard
          level="warm"
          count={stats.warm}
          label={t('interest.level.warm')}
          description={t('interest.tooltip.warm')}
          icon={Activity}
          gradient="from-orange-400 to-orange-600"
        />
        <KPICard
          level="hot"
          count={stats.hot}
          label={t('interest.level.hot')}
          description={t('interest.tooltip.hot')}
          icon={Flame}
          gradient="from-rose-500 to-rose-700"
        />
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-200 bg-[#FAFAFA] flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-serif font-bold text-[#121212] text-lg flex items-center">
            {t('interest.table_title')}
            {activeKpi !== 'all' && (
              <span className="ml-3 text-xs bg-[#121212] text-white px-2 py-0.5 rounded-sm uppercase tracking-wider font-sans animate-in zoom-in-95 duration-300">
                {t(`interest.level.${activeKpi}`)}
              </span>
            )}
          </h3>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder={t('interest.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#121212] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredData.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <Info className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm font-medium">{t('interest.empty')}</p>
            </div>
          ) : (
            filteredData.map((item, idx) => {
              const { offer, score, views, totalDurationMs } = item;
              const stone = stones.find(s => s.id === offer.stoneId);

              return (
                <div
                  key={offer.id}
                  onClick={() => onSelectTransaction(item)}
                  className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-center gap-6 cursor-pointer group"
                >
                  <div className="text-center w-16 shrink-0">
                    <div className="text-2xl font-serif text-[#121212] mb-1">#{idx + 1}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score: {Math.round(score)}</div>
                  </div>

                  <div className="w-16 h-16 bg-slate-100 shrink-0 border border-slate-200 overflow-hidden rounded-sm">
                    {stone && <img src={stone.imageUrl} alt={stone.typology.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />}
                  </div>

                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <h4 className="font-bold text-[#121212] text-lg group-hover:text-[#C2410C] transition-colors">{offer.clientName}</h4>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">
                      {stone?.typology.name} • Lote {stone?.lotId}
                    </p>
                    {role === 'industry_admin' && (
                      <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                        ↳ {getPartnerLabel(offer)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-8 shrink-0">
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#121212] mb-0.5 flex items-center justify-center">
                        <Eye className="w-4 h-4 mr-1.5 text-slate-400" /> {views}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-slate-400">{t('interest.metrics.views')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#121212] mb-0.5 flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-1.5 text-slate-400" /> {formatDurationFriendly(totalDurationMs)}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-slate-400">{t('interest.metrics.time')}</div>
                    </div>
                  </div>

                  <div className="shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewClientPage(offer.clientViewToken); }}
                      className="p-2 text-slate-400 hover:text-[#C2410C] transition-colors"
                      title="Ver Página"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-[#121212] transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
