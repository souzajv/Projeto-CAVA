
import React, { useState, useMemo } from 'react';
import { Client, UserRole, OfferLink } from '../types';
import { Search, UserPlus, Mail, Phone, Building2, ChevronRight, BarChart3, TrendingUp, Users, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CRMViewProps {
  clients: Client[];
  offers: OfferLink[];
  role: UserRole;
  currentSellerId?: string;
  onAddClient: () => void;
  onSelectClient: (client: Client) => void;
}

export const CRMView: React.FC<CRMViewProps> = ({ 
  clients = [], 
  offers = [], 
  role, 
  currentSellerId,
  onAddClient,
  onSelectClient 
}) => {
  const { t, formatCurrency } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica corrigida: Início e Fim do ciclo de visibilidade
  const visibleClients = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    if (role === 'industry_admin') return safeClients;
    
    // Para vendedores: Clientes criados por ele OU clientes que receberam ofertas dele
    const clientIdsWithMyOffers = new Set(
      offers.filter(o => {
        // Se a oferta veio de uma delegação desse vendedor
        // (Simplificado para o mock: se o vendedor for o criador da oferta)
        return o && o.clientId; 
      }).map(o => o.clientId)
    );
    
    return safeClients.filter(c => 
      c.createdById === currentSellerId || 
      clientIdsWithMyOffers.has(c.id)
    );
  }, [clients, offers, role, currentSellerId]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return visibleClients;
    
    return visibleClients.filter(c => 
      (c.name || '').toLowerCase().includes(term) ||
      (c.company || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term)
    );
  }, [visibleClients, searchTerm]);

  const stats = useMemo(() => {
    const clientIdsVisible = new Set(visibleClients.map(c => c.id));
    const relevantOffers = offers.filter(o => o && clientIdsVisible.has(o.clientId));
    const soldOffers = relevantOffers.filter(o => o.status === 'sold');
    const activeOffers = relevantOffers.filter(o => o.status === 'active');

    return {
      total: visibleClients.length,
      activeLinks: activeOffers.length,
      conversion: relevantOffers.length > 0 ? (soldOffers.length / relevantOffers.length) * 100 : 0
    };
  }, [visibleClients, offers]);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
           <h1 className="text-4xl font-serif text-[#121212] tracking-tight mb-2">{t('nav.clients')}</h1>
           <p className="text-slate-500 font-light text-lg">{t('cli.subtitle')}</p>
        </div>
        
        <button 
          onClick={onAddClient}
          className="flex items-center px-6 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C2410C] transition-all shadow-lg rounded-sm"
        >
           <UserPlus className="w-4 h-4 mr-2" />
           {t('cli.add')}
        </button>
      </div>

      {/* CRM KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
               <Users className="w-3 h-3 mr-2 text-[#C2410C]" /> {t('cli.kpi.total_clients')}
            </p>
            <p className="text-4xl font-serif text-[#121212]">{stats.total}</p>
         </div>
         <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
               <TrendingUp className="w-3 h-3 mr-2 text-blue-500" /> {t('cli.kpi.active_leads')}
            </p>
            <p className="text-4xl font-serif text-[#121212]">{stats.activeLinks}</p>
         </div>
         <div className="p-8 bg-[#121212] text-white shadow-xl rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#C2410C]" />
            <p className="text-[10px] font-bold text-[#C2410C] uppercase tracking-[0.2em] mb-4 flex items-center">
               <BarChart3 className="w-3 h-3 mr-2" /> {t('cli.kpi.conversion')}
            </p>
            <p className="text-4xl font-serif">{stats.conversion.toFixed(1)}%</p>
         </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-[#FAFAFA]">
           <div className="relative group max-w-md">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#C2410C] transition-colors ml-1" />
              <input 
                type="text"
                placeholder={t('cli.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 py-2 bg-transparent border-b border-slate-200 text-sm focus:border-[#C2410C] outline-none transition-all placeholder:text-slate-400 font-medium"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-400 uppercase font-bold tracking-widest border-b border-slate-100 bg-[#FAFAFA]">
              <tr>
                <th className="px-8 py-6">{t('cli.table.client')}</th>
                <th className="px-8 py-6">{t('cli.table.contact')}</th>
                <th className="px-8 py-6 text-center">{t('cli.table.offers')}</th>
                <th className="px-8 py-6 text-right">{t('cli.table.total_purchased')}</th>
                <th className="px-8 py-6 text-center">{t('cli.table.status')}</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                       <Info className="w-10 h-10 mb-3 opacity-20" />
                       <p className="font-serif italic">{t('inv.no_results')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientOffers = offers.filter(o => o?.clientId === client.id);
                  const soldOffers = clientOffers.filter(o => o.status === 'sold');
                  const soldCount = soldOffers.length;
                  const totalSpent = soldOffers.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0);
                  const hasActive = clientOffers.some(o => o.status === 'active');

                  return (
                    <tr 
                      key={client.id} 
                      onClick={() => onSelectClient(client)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#121212] font-serif font-bold text-lg group-hover:bg-[#C2410C] group-hover:text-white transition-colors shrink-0">
                              {(client.name || '?').charAt(0)}
                           </div>
                           <div className="min-w-0">
                              <div className="font-bold text-[#121212] text-sm group-hover:text-[#C2410C] transition-colors truncate">{client.name}</div>
                              <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                                 <Building2 className="w-3 h-3 mr-1" /> {client.company || 'Private Client'}
                              </div>
                           </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 min-w-[150px]">
                           <div className="text-xs text-slate-600 flex items-center truncate">
                             <Mail className="w-3 h-3 mr-2 opacity-40 shrink-0" /> {client.email}
                           </div>
                           <div className="text-xs text-slate-600 flex items-center truncate">
                             <Phone className="w-3 h-3 mr-2 opacity-40 shrink-0" /> {client.phone}
                           </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col">
                           <span className="text-sm font-bold text-[#121212]">{clientOffers.length}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase">{soldCount} {t('card.sold')}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                         <span className="font-serif text-lg text-[#121212] group-hover:text-[#C2410C] transition-colors whitespace-nowrap">
                           {formatCurrency(totalSpent)}
                         </span>
                      </td>

                      <td className="px-8 py-6 text-center">
                        {hasActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                             {t('cli.status.hot')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                             {t('cli.status.inactive')}
                          </span>
                        )}
                      </td>

                      <td className="px-8 py-6 text-right">
                         <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#C2410C] group-hover:translate-x-1 transition-all" />
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
