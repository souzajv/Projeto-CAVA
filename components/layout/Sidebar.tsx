
import React from 'react';
import { LayoutGrid, TrendingUp, DollarSign, Link as LinkIcon, Package, UserCircle, Archive, Thermometer, Users, X } from 'lucide-react';
import { UserRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export type PageView = 'inventory' | 'lot_history' | 'dashboard' | 'pipeline' | 'sales' | 'financials' | 'thermometer' | 'clients';

interface SidebarProps {
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  role: UserRole;
  currentUserName: string;
  currentUserRoleLabel: string;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  role,
  currentUserName,
  currentUserRoleLabel,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { t } = useLanguage();

  const NavItem = ({ page, icon: Icon, label }: { page: PageView; icon: any; label: string }) => {
    const isActive = activePage === page;
    return (
      <button
        onClick={() => {
          onNavigate(page);
          onCloseMobile?.();
        }}
        className={`relative w-full flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-sm transition-all duration-300 group overflow-hidden ${isActive
          ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#C2410C] shadow-[0_0_10px_#C2410C]" />
        )}
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${isActive ? 'text-[#C2410C]' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className={`font-medium text-xs sm:text-sm tracking-wide ${isActive ? 'font-semibold' : ''}`}>{label}</span>
      </button>
    );
  };

  return (
    <aside
      className={`${isMobileOpen ? 'flex' : 'hidden'} lg:flex w-full max-w-[420px] sm:max-w-[460px] sm:w-[88vw] min-w-[90vw] sm:min-w-[88vw] lg:min-w-0 lg:w-72 shrink-0 bg-[#121212] border-r border-white/5 h-screen fixed inset-y-0 left-0 flex-col shadow-2xl z-50 text-white relative transform transition-transform duration-300 will-change-transform
      ${isMobileOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}
      lg:translate-x-0 lg:pointer-events-auto`}
    >
      {/* <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" /> */}
      <div className="p-4 pl-5 flex items-center justify-between lg:hidden relative z-10 overflow-visible">
        <div className="flex items-center space-x-3 overflow-visible">
          <div className="w-9 h-9 bg-[#C2410C] rounded-sm flex items-center justify-center shadow-lg shadow-[#C2410C]/20 rotate-3">
            <span className="text-white font-serif font-bold text-lg">C</span>
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-serif font-bold tracking-tight text-white">CAVA.</h1>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#C2410C] font-medium opacity-80">Architecture</p>
          </div>
        </div>
        <button onClick={onCloseMobile} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-8 pb-10 relative z-10 hidden lg:block">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#C2410C] rounded-sm flex items-center justify-center shadow-lg shadow-[#C2410C]/20 rotate-3 transition-transform hover:rotate-0">
            <span className="text-white font-serif font-bold text-2xl">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-white">CAVA.</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#C2410C] font-medium opacity-80">Architecture</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 sm:px-4 space-y-1 relative z-10 overflow-y-auto dark-scroll">
        <div className="px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-2 mt-1">
          {t('nav.operations')}
        </div>
        <NavItem page="inventory" icon={Package} label={t('nav.inventory')} />
        <NavItem page="clients" icon={Users} label={t('nav.clients')} />
        <NavItem page="thermometer" icon={Thermometer} label={t('nav.thermometer')} />
        <NavItem page="lot_history" icon={Archive} label={t('nav.lot_history')} />
        <div className="px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] mt-6 mb-2">
          {t('nav.analytics')}
        </div>
        <NavItem page="dashboard" icon={LayoutGrid} label={t('nav.dashboard')} />
        <NavItem page="pipeline" icon={LinkIcon} label={t('nav.pipeline')} />
        <NavItem page="sales" icon={DollarSign} label={t('nav.sales')} />
        <NavItem page="financials" icon={TrendingUp} label={role === 'industry_admin' ? t('nav.financials_admin') : t('nav.financials_seller')} />
      </div>
      <div className="p-3 sm:p-4 border-t border-white/5 relative z-10">
        <div className="bg-white/5 rounded-sm p-3 flex items-center space-x-3 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 shadow-inner">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate font-serif tracking-wide">{currentUserName}</p>
            <p className="text-[11px] sm:text-xs text-[#C2410C] truncate capitalize tracking-wider">{currentUserRoleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
