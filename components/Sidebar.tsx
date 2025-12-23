
import React from 'react';
import { LayoutGrid, TrendingUp, DollarSign, Link as LinkIcon, Package, UserCircle, Archive, Thermometer } from 'lucide-react';
import { UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export type PageView = 'inventory' | 'lot_history' | 'dashboard' | 'pipeline' | 'sales' | 'financials' | 'thermometer';

interface SidebarProps {
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  role: UserRole;
  currentUserName: string;
  currentUserRoleLabel: string;
  onLogout?: () => void; 
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  role, 
  currentUserName,
  currentUserRoleLabel 
}) => {
  const { t } = useLanguage();
  
  const NavItem = ({ page, icon: Icon, label }: { page: PageView; icon: any; label: string }) => {
    const isActive = activePage === page;
    return (
      <button
        onClick={() => onNavigate(page)}
        className={`relative w-full flex items-center space-x-3 px-4 py-3.5 rounded-sm transition-all duration-300 group overflow-hidden ${
          isActive 
            ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#C5A059] shadow-[0_0_10px_#C5A059]" />
        )}
        <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-[#C5A059]' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className={`font-medium text-sm tracking-wide ${isActive ? 'font-semibold' : ''}`}>{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-[#121212] border-r border-white/5 h-screen sticky top-0 flex flex-col hidden lg:flex shadow-2xl z-40 text-white relative overflow-hidden">
      
      {/* Background Texture Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Brand */}
      <div className="p-8 pb-10 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#C5A059] rounded-sm flex items-center justify-center shadow-lg shadow-[#C5A059]/20 rotate-3 transition-transform hover:rotate-0">
            <span className="text-[#121212] font-serif font-bold text-2xl">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-white">CAVA.</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-medium opacity-80">Architecture</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 mt-2">
          {t('nav.operations')}
        </div>
        <NavItem page="inventory" icon={Package} label={t('nav.inventory')} />
        <NavItem page="thermometer" icon={Thermometer} label={t('nav.thermometer')} />
        <NavItem page="lot_history" icon={Archive} label={t('nav.lot_history')} />
        
        <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-8 mb-2">
          {t('nav.analytics')}
        </div>
        <NavItem page="dashboard" icon={LayoutGrid} label={t('nav.dashboard')} />
        <NavItem page="pipeline" icon={LinkIcon} label={t('nav.pipeline')} />
        <NavItem page="sales" icon={DollarSign} label={t('nav.sales')} />
        <NavItem page="financials" icon={TrendingUp} label={role === 'industry_admin' ? t('nav.financials_admin') : t('nav.financials_seller')} />
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 relative z-10">
        <div className="bg-white/5 rounded-sm p-3 flex items-center space-x-3 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 shadow-inner">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate font-serif tracking-wide">{currentUserName}</p>
            <p className="text-xs text-[#C5A059] truncate capitalize tracking-wider">{currentUserRoleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
