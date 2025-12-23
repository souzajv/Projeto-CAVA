
import React, { useState, useMemo } from 'react';
import { OfferLink, StoneItem, Seller, InterestLevel, UserRole } from '../types';
import { useInterestAnalytics } from '../hooks/useInterestAnalytics';
import { Thermometer, Snowflake, Activity, Flame, TrendingUp, Search, Filter, Info, Eye, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InterestThermometerViewProps {
  offers: OfferLink[];
  stones: StoneItem[];
  sellers: Seller[];
  role: UserRole;
  onSelectTransaction: (data: any) => void;
  onViewClientPage: (token: string) => void;
}

export const InterestThermometerView: React.FC<InterestThermometerViewProps> = ({ 
  offers, stones, sellers, role, onSelectTransaction, onViewClientPage 
}) => {
  const { t, formatCurrency, formatDate } = useLanguage();
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
      base = base.filter(a => 
        a.offer.clientName.toLowerCase().includes(lower) ||
        stones.find(s => s.id === a.offer.stoneId)?.typology.name.toLowerCase().includes(lower) ||
        stones.find(s => s.id === a.offer.stoneId)?.lotId.toLowerCase().includes(lower)
      );
    }
    
    return base;
  }, [analytics, activeKpi, searchTerm, stones]);

  const KPICard = ({ level, count, label, icon: Icon, activeColor, gradient }: any) => (
    <div className="relative group flex-1">
      <button 
        onClick={() => setActiveKpi(activeKpi === level ? 'all' : level)}
        className={`relative w-full p-8 rounded-sm transition-all duration-500 text-left overflow-hidden h-48 flex flex-col justify-between border ${
          activeKpi === level 
          ? 'border-transparent shadow-2xl' 
          : 'bg-white border-slate-100 hover:border-[#121212]'
        }`}
      >
        {activeKpi === level && (
           <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}

        <div className="flex justify-between items-start relative z-10">
          <Icon className={`w-6 h-6 ${activeKpi === level ? 'text-white' : 'text-slate-400'}`} />
          <span className={`text-5xl font-serif ${activeKpi === level ? 'text-white' : 'text-[#121212]'}`}>
            {count}
          </span>
        </div>
        
        <div className="relative z-10">
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${activeKpi === level ? 'text-white/80' : 'text-slate-400'}`}>
            {label}
          </p>
        </div>
      </button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="border-b border-slate-200 pb-8">
          <h2 className="text-4xl font-serif text-[#121212] tracking-tight mb-2 flex items-center">
            {t('interest.title')}
          </h2>
          <p className="text-slate-500 font-light text-lg">{t('interest.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <KPICard 
          level="ice" 
          count={stats.ice} 
          label={t('interest.level.ice')} 
          icon={Snowflake} 
          gradient="from-slate-700 to-slate-900"
        />
        <KPICard 
          level="neutral" 
          count={stats.neutral} 
          label={t('interest.level.neutral')} 
          icon={Activity} 
          gradient="from-slate-600 to-slate-800"
        />
        <KPICard 
          level="hot" 
          count={stats.hot} 
          label={t('interest.level.hot')} 
          icon={TrendingUp} 
          gradient="from-orange-500 to-rose-500"
        />
        <KPICard 
          level="boiling" 
          count={stats.boiling} 
          label={t('interest.level.boiling')} 
          icon={Flame} 
          gradient="from-rose-600 to-red-900"
        />
      </div>

      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#FAFAFA]">
          <h3 className="font-bold text-[#121212] text-xs uppercase tracking-[0.2em] flex items-center">
            {t('interest.table_title')}
            {activeKpi !== 'all' && (
              <span className="ml-3 px-2 py-1 bg-[#121212] text-white text-[9px] rounded-sm uppercase tracking-widest">
                {activeKpi}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-4">
             <div className="relative w-64">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={t('interest.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 py-2 bg-transparent border-b border-slate-200 text-sm focus:border-[#121212] outline-none transition-all placeholder:text-slate-300"
                />
             </div>
             <button 
                onClick={() => { setSearchTerm(''); setActiveKpi('all'); }}
                className="text-slate-400 hover:text-[#121212] transition-colors"
             >
                <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">{t('interest.table.rank')}</th>
                <th className="px-8 py-6">{t('dash.table.client')}</th>
                <th className="px-8 py-6">{t('dash.table.stone')}</th>
                <th className="px-8 py-6 text-center">{t('interest.table.engagement')}</th>
                <th className="px-8 py-6 text-right">{t('dash.table.value')}</th>
                <th className="px-8 py-6 text-center">{t('dash.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-slate-400 font-serif italic">
                     {t('interest.empty')}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const stone = stones.find(s => s.id === item.offer.stoneId)!;
                  
                  return (
                    <tr 
                      key={item.offer.id}
                      onClick={() => onSelectTransaction(item)}
                      className="hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                    >
                      <td className="px-8 py-6">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm ${
                          index < 3 ? 'text-[#C5A059]' : 'text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-[#121212] group-hover:text-[#C5A059] transition-colors">{item.offer.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{formatDate(item.offer.createdAt)}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-serif text-lg text-[#121212]">{stone?.typology.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{stone?.lotId}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center space-x-8">
                          <div className="text-center group-hover:scale-105 transition-transform">
                            <div className="flex items-center justify-center text-xs font-bold text-[#121212]">
                              <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-300" /> {item.views}
                            </div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">{t('interest.metrics.views')}</div>
                          </div>
                          <div className="text-center group-hover:scale-105 transition-transform delay-75">
                            <div className="flex items-center justify-center text-xs font-bold text-[#121212]">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-300" /> 
                              {formatDurationFriendly(item.totalDurationMs)}
                            </div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">{t('interest.metrics.time')}</div>
                          </div>
                          <div className="p-2">
                            {item.interestLevel === 'boiling' && <Flame className="w-5 h-5 text-rose-600 animate-pulse" />}
                            {item.interestLevel === 'hot' && <TrendingUp className="w-5 h-5 text-orange-500" />}
                            {item.interestLevel === 'neutral' && <Activity className="w-5 h-5 text-slate-400" />}
                            {item.interestLevel === 'ice' && <Snowflake className="w-5 h-5 text-blue-200" />}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="font-serif text-lg text-[#121212]">{formatCurrency(item.offer.finalPrice * item.offer.quantityOffered)}</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <button 
                             onClick={(e) => { e.stopPropagation(); onViewClientPage(item.offer.clientViewToken); }}
                             className="p-2 text-slate-300 hover:text-[#121212] transition-colors"
                         >
                             <ExternalLink className="w-4 h-4" />
                         </button>
                      </td>
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
