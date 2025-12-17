import React from 'react';
import { LayoutGrid, BarChart3, TrendingUp, DollarSign, Link as LinkIcon, Package, UserCircle, LogOut } from 'lucide-react';
import { UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export type PageView = 'inventory' | 'dashboard' | 'pipeline' | 'sales' | 'financials';

interface SidebarProps {
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  role: UserRole;
  currentUserName: string;
  currentUserRoleLabel: string;
  onLogout?: () => void; // Optional demo logout/switch
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
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
        <span className="font-medium text-sm">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden lg:flex shadow-xl shadow-slate-200/50 z-40">
      
      {/* Brand */}
      <div className="p-6 pb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">CAVA</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1">
        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {t('nav.operations')}
        </div>
        <NavItem page="inventory" icon={Package} label={t('nav.inventory')} />
        
        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-2">
          {t('nav.analytics')}
        </div>
        <NavItem page="dashboard" icon={LayoutGrid} label={t('nav.dashboard')} />
        <NavItem page="pipeline" icon={LinkIcon} label={t('nav.pipeline')} />
        <NavItem page="sales" icon={DollarSign} label={t('nav.sales')} />
        <NavItem page="financials" icon={TrendingUp} label={role === 'industry_admin' ? t('nav.financials_admin') : t('nav.financials_seller')} />
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
            <UserCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{currentUserName}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{currentUserRoleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
