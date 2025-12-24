
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppState, StoneItem, Seller, SalesDelegation, OfferLink, Notification, 
  UserRole, StoneTypology 
} from './types';
import { MOCK_STONES, MOCK_SELLERS, MOCK_DELEGATIONS, MOCK_OFFERS, MOCK_TYPOLOGIES } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Components
import { Sidebar, PageView } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StoneCard } from './components/StoneCard';
import { ClientView } from './components/ClientView';
import { ToastContainer } from './components/Toast';
import { InventoryFilters } from './components/InventoryFilters';
import { CatalogView } from './components/CatalogView';
import { BatchModal } from './components/BatchModal';
import { TypologyModal } from './components/TypologyModal';
import { DelegateModal } from './components/DelegateModal';
import { OfferModal } from './components/OfferModal';
import { DirectLinkModal } from './components/DirectLinkModal';
import { LinkHistoryModal } from './components/LinkHistoryModal';
import { KPIDetailsModal, KPIMode } from './components/KPIDetailsModal';
import { CancelLinkModal } from './components/CancelLinkModal';
import { ConfirmSaleModal } from './components/ConfirmSaleModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { AnalyticsDetailView, AnalyticsMode } from './components/AnalyticsDetailView';
import { SellerInventoryModal } from './components/SellerInventoryModal';
import { IndustryInventoryModal } from './components/IndustryInventoryModal';
import { InterestThermometerView } from './components/InterestThermometerView';
import { NotificationDropdown } from './components/NotificationDropdown';

import { 
  Archive, FilterX, Bell, Plus, UserCircle, LogOut, Package, Book, Search, Filter
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Helper function defined outside component to avoid recreation
const reconcileInventory = (
  baseStones: StoneItem[], 
  currentDelegations: SalesDelegation[], 
  currentOffers: OfferLink[]
): StoneItem[] => {
  return baseStones.map(stone => {
    // 1. Calculate SOLD quantity
    const soldQuantity = currentOffers
      .filter(o => o.stoneId === stone.id && o.status === 'sold')
      .reduce((sum, o) => sum + o.quantityOffered, 0);

    // 2. Calculate RESERVED quantity
    // Reserved = (Sum of Delegations) + (Sum of Active Direct Offers from Admin)
    const delegatedQuantity = currentDelegations
      .filter(d => d.stoneId === stone.id)
      .reduce((sum, d) => sum + d.delegatedQuantity, 0);

    // Active Direct Offers (Admin direct links, no delegation)
    const directActiveQuantity = currentOffers
      .filter(o => o.stoneId === stone.id && o.status === 'active' && !o.delegationId)
      .reduce((sum, o) => sum + o.quantityOffered, 0);

    const reservedQuantity = delegatedQuantity + directActiveQuantity;

    // 3. Calculate AVAILABLE
    const availableQuantity = Math.max(0, stone.quantity.total - reservedQuantity - soldQuantity);

    return {
      ...stone,
      quantity: {
        ...stone.quantity,
        available: availableQuantity,
        reserved: reservedQuantity,
        sold: soldQuantity
      }
    };
  });
};

const AppContent = () => {
  const { t, formatCurrency } = useLanguage();

  // --- STATE ---
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
  
  // Initialize Raw State from Mocks
  const [delegations, setDelegations] = useState<SalesDelegation[]>(MOCK_DELEGATIONS);
  const [offers, setOffers] = useState<OfferLink[]>(MOCK_OFFERS);
  const [rawStones, setRawStones] = useState<StoneItem[]>(MOCK_STONES); // The 'DB'
  const [typologies, setTypologies] = useState<StoneTypology[]>(MOCK_TYPOLOGIES); // The Catalog

  // Stones are DERIVED via useMemo to ensure they are always consistent with rawStones/delegations/offers
  // This avoids "undefined" states during initial render or effect cycles.
  const stones = useMemo(() => {
    return reconcileInventory(rawStones, delegations, offers);
  }, [rawStones, delegations, offers]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('industry_admin');
  const [currentSellerId, setCurrentSellerId] = useState<string>('all'); // Default to 'all' for Admin view
  const [currentView, setCurrentView] = useState<AppState['currentView']>('dashboard');
  const [activePage, setActivePage] = useState<PageView>('dashboard');
  
  // Inventory State
  const [inventoryTab, setInventoryTab] = useState<'stock' | 'catalog'>('stock');
  
  // Inventory Filters
  const [invSearch, setInvSearch] = useState('');
  const [invTypologyFilter, setInvTypologyFilter] = useState('all');
  const [invStatusFilter, setInvStatusFilter] = useState('all');

  // Modals
  const [activeModal, setActiveModal] = useState<{
    type: 'delegate' | 'offer' | 'direct' | 'history' | 'kpi' | 'cancel' | 'confirm_sale' | 'transaction' | 'seller_inv' | 'industry_inv' | 'typology' | 'batch' | null;
    data?: any;
  }>({ type: null });

  const [showNotifications, setShowNotifications] = useState(false);

  // --- VISIBILITY FILTER ---
  // Central logic to determine which offers the current user can see
  const visibleOffers = useMemo(() => {
    if (currentUserRole === 'industry_admin') {
      // If "All Sellers" is selected (or default), return everything
      if (currentSellerId === 'all') {
        return offers;
      }
      // If a specific seller is selected in the filter, return only their delegated offers
      return offers.filter(o => {
        // Direct sales (no delegation) should NOT be shown when filtering by a specific seller
        if (!o.delegationId) return false; 
        
        const del = delegations.find(d => d.id === o.delegationId);
        return del && del.sellerId === currentSellerId;
      });
    } else {
      // Seller Mode: Sees ONLY offers linked to their delegations (using currentSellerId as the logged-in ID)
      return offers.filter(o => {
        if (!o.delegationId) return false; // Ignore direct/HQ links
        const del = delegations.find(d => d.id === o.delegationId);
        return del && del.sellerId === currentSellerId;
      });
    }
  }, [offers, currentUserRole, currentSellerId, delegations]);


  // --- DERIVED STATE ---
  const currentUser = currentUserRole === 'industry_admin' 
    ? { name: 'HQ Admin', roleLabel: 'Global Admin' }
    : { name: sellers.find(s => s.id === currentSellerId)?.name || 'Seller', roleLabel: 'Partner' };

  // KPI Calculations use visibleOffers now
  const kpi = useMemo(() => {
     const active = visibleOffers.filter(o => o.status === 'active');
     const sold = visibleOffers.filter(o => o.status === 'sold');
     
     if (currentUserRole === 'industry_admin') {
       return {
         pipelineRevenue: active.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0),
         soldRevenue: sold.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0),
         totalProfit: sold.reduce((sum, o) => {
            const stone = stones.find(s => s.id === o.stoneId);
            const cost = stone ? stone.baseCost * o.quantityOffered : 0;
            return sum + ((o.finalPrice * o.quantityOffered) - cost);
         }, 0),
         labelProfit: t('dash.kpi.profit_admin')
       };
     } else {
       // Seller View
       return {
         pipelineRevenue: active.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0),
         soldRevenue: sold.reduce((sum, o) => sum + (o.finalPrice * o.quantityOffered), 0),
         totalProfit: sold.reduce((sum, o) => {
            const del = delegations.find(d => d.id === o.delegationId);
            const cost = del ? del.agreedMinPrice * o.quantityOffered : 0;
            return sum + ((o.finalPrice * o.quantityOffered) - cost);
         }, 0),
         labelProfit: t('dash.kpi.profit_seller')
       };
     }
  }, [visibleOffers, stones, delegations, currentUserRole, t]);

  // --- ACTIONS ---

  const addNotification = (msg: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      recipientId: currentUserRole === 'industry_admin' ? 'admin' : currentSellerId,
      message: msg,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      isToast: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDelegate = (stoneId: string, sellerId: string, quantity: number, minPrice: number) => {
    // Check availability based on RECONCILED state
    const stone = stones.find(s => s.id === stoneId);
    if (!stone) return;
    
    // Strict availability check
    if (stone.quantity.available < quantity) {
        addNotification(t('toast.error_avail', { qty: stone.quantity.available }), 'alert');
        return;
    }

    // Create Delegation
    const newDelegation: SalesDelegation = {
      id: `del-${Date.now()}`,
      stoneId,
      sellerId,
      delegatedQuantity: quantity,
      agreedMinPrice: minPrice,
      createdAt: new Date().toISOString()
    };

    setDelegations(prev => [...prev, newDelegation]);
    addNotification(
      t('toast.delegated', { qty: quantity, unit: t(`unit.${stone.quantity.unit}`), stone: stone.typology.name }), 
      'success'
    );
    setActiveModal({ type: null });
  };

  const handleCreateOffer = (offer: OfferLink) => {
    setOffers(prev => [offer, ...prev]);
    addNotification(t('toast.link_ready'), 'success');
    setActiveModal({ type: null });
  };

  const handleFinalizeSale = (offer: OfferLink) => {
    // 1. Mark offer as sold
    const updatedOffers = offers.map(o => o.id === offer.id ? { ...o, status: 'sold' as const } : o);
    setOffers(updatedOffers);

    // 2. IMPORTANT: If this was a DELEGATED sale, we must reduce the Delegation Quantity
    // so the inventory moves from "Reserved (Delegated)" to "Sold" in the math.
    if (offer.delegationId) {
        const updatedDelegations = delegations.map(d => {
            if (d.id === offer.delegationId) {
                return {
                    ...d,
                    delegatedQuantity: Math.max(0, d.delegatedQuantity - offer.quantityOffered)
                };
            }
            return d;
        });
        setDelegations(updatedDelegations);
    }

    addNotification(
      t('toast.sale_confirmed', { client: offer.clientName, value: formatCurrency(offer.finalPrice * offer.quantityOffered) }), 
      'success'
    );
    setActiveModal({ type: null });
  };

  const handleCancelLink = (offer: OfferLink) => {
    const updatedOffers = offers.map(o => o.id === offer.id ? { ...o, status: 'expired' as const } : o);
    setOffers(updatedOffers);
    // Note: Reconcile logic handles the rest. If it was a Direct Link (active), it occupied Reserved stock. 
    // Now it's expired, so it frees up stock automatically in reconcileInventory.
    
    addNotification(t('toast.link_cancelled', { client: offer.clientName }), 'alert');
    setActiveModal({ type: null });
  };

  const handleRevokeDelegation = (delegationId: string) => {
      const del = delegations.find(d => d.id === delegationId);
      if (!del) return;

      // Check if there are ACTIVE offers linked to this delegation
      const activeLinkedOffers = offers.filter(o => o.delegationId === delegationId && o.status === 'active');
      if (activeLinkedOffers.length > 0) {
          addNotification(t('msg.revoke_block_active'), 'alert');
          return;
      }

      // Safe to remove
      setDelegations(prev => prev.filter(d => d.id !== delegationId));
      addNotification(t('toast.delegation_revoked'), 'info');
      setActiveModal({ type: null }); // Close modal to refresh
  };

  // --- RENDER HELPERS ---

  const renderLotHistory = () => {
    // 1. Filter logic based on role
    const historyStones = stones.filter(stone => {
       if (currentUserRole === 'industry_admin') {
          // Global History: Stone is completely sold out physically
          return stone.quantity.available === 0 && stone.quantity.reserved === 0 && stone.quantity.sold > 0;
       } else {
          // Seller History: Stone where the seller had a delegation, and that delegation is now empty (sold out)
          const delegation = delegations.find(d => d.stoneId === stone.id && d.sellerId === currentSellerId);
          if (!delegation) return false;

          // Check if seller has depleted their stock
          const sellerOffers = visibleOffers.filter(o => o.delegationId === delegation.id);
          const sold = sellerOffers.filter(o => o.status === 'sold').reduce((sum,o) => sum + o.quantityOffered, 0);
          const active = sellerOffers.filter(o => o.status === 'active').reduce((sum,o) => sum + o.quantityOffered, 0);
          
          // Remaining delegation qty
          const remaining = delegation.delegatedQuantity - sold - active;
          
          // Condition: No remaining stock, no active links (everything resolved), and at least 1 sold item (to be history, not just empty)
          return remaining <= 0 && active === 0 && sold > 0;
       }
    });

    const filteredStones = historyStones.filter(stone => { 
        const matchesSearch = !invSearch || stone.lotId.toLowerCase().includes(invSearch.toLowerCase()) || stone.typology.name.toLowerCase().includes(invSearch.toLowerCase()); 
        const matchesTypology = invTypologyFilter === 'all' || stone.typology.id === invTypologyFilter; 
        return matchesSearch && matchesTypology; 
    });
    const isFilterActive = invSearch || invTypologyFilter !== 'all';

    return (
      <div className="space-y-8">
        
        {/* NON-STICKY Header Content */}
        <div className="pt-8 lg:pt-12 mb-2">
           <h2 className="text-3xl font-serif text-[#121212]">
             {t('inv.history_title')}
           </h2>
           <p className="text-slate-500 mt-2 font-light">{t('inv.history_subtitle')}</p>
        </div>

        {/* STICKY HEADER for Filters ONLY - Reduced Padding */}
        <div className="sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur-sm py-3 -mx-8 px-8 border-b border-slate-200 shadow-sm mb-8">
          <div className="max-w-[1600px] mx-auto">
            {historyStones.length > 0 && ( 
               <div className="mb-0">
                 <InventoryFilters 
                    searchTerm={invSearch} 
                    onSearchChange={setInvSearch} 
                    statusFilter="sold" 
                    onStatusFilterChange={() => {}} 
                    typologyFilter={invTypologyFilter} 
                    onTypologyFilterChange={setInvTypologyFilter} 
                    typologies={typologies} 
                  /> 
               </div>
            )}
          </div>
        </div>

        {historyStones.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <Archive className="w-12 h-12 text-slate-200 mb-6" />
            <p className="text-slate-400 font-medium">{t('inv.history_empty')}</p>
          </div>
        ) : filteredStones.length === 0 && isFilterActive ? (
          <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <FilterX className="w-12 h-12 text-slate-200 mb-6" />
            <p className="text-slate-400 font-medium">{t('inv.no_results')}</p>
            <button onClick={() => { setInvSearch(''); setInvTypologyFilter('all'); }} className="mt-6 text-sm font-bold text-[#C5A059] hover:underline">{t('common.clear')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStones.map((stone, i) => {
                if (currentUserRole === 'industry_admin') {
                  return (
                    <StoneCard 
                        key={stone.id} 
                        stone={stone} 
                        role="industry_admin" 
                        onClick={() => setActiveModal({ type: 'industry_inv', data: stone })} 
                        index={i} 
                    />
                  );
                } else {
                  // For Seller, pass the delegation context so card shows correct "sold" stats
                  const delegation = delegations.find(d => d.stoneId === stone.id && d.sellerId === currentSellerId);
                  const myOffersCount = visibleOffers.filter(o => o.delegationId === delegation?.id).length;
                  
                  return (
                    <StoneCard 
                        key={stone.id} 
                        stone={stone} 
                        role="seller" 
                        delegation={delegation}
                        offerCount={myOffersCount}
                        onClick={() => setActiveModal({ type: 'seller_inv', data: { stone, delegation } })} 
                        index={i} 
                    />
                  );
                }
            })}
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => {
    // Determine what to render based on sub-tab
    if (inventoryTab === 'catalog' && currentUserRole === 'industry_admin') {
       const filteredTypologies = typologies.filter(t => 
          !invSearch || t.name.toLowerCase().includes(invSearch.toLowerCase())
       );
       
       return (
         <div className="space-y-8">
            {/* NON-STICKY Header: Title & Actions */}
            <div className="pt-8 lg:pt-12 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                   <div>
                      <h2 className="text-3xl font-serif text-[#121212] tracking-tight">{t('nav.inventory')}</h2>
                      <p className="text-slate-500 mt-2 font-light">{t('inv.your_inventory')}</p>
                   </div>
                   
                   <div className="flex gap-4 items-center">
                       <div className="flex bg-slate-100 p-1 rounded-sm gap-1">
                          <button 
                            onClick={() => setInventoryTab('stock')}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#121212] transition-colors"
                          >
                            {t('inv.tab.stock')}
                          </button>
                          <button 
                            onClick={() => setInventoryTab('catalog')}
                            className="px-4 py-2 bg-white text-[#121212] shadow-sm text-xs font-bold uppercase tracking-widest rounded-sm"
                          >
                            {t('inv.tab.catalog')}
                          </button>
                       </div>

                       <button 
                          onClick={() => setActiveModal({ type: 'typology', data: null })}
                          className="px-5 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] shadow-lg transition-all flex items-center"
                       >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('cat.add_btn')}
                       </button>
                   </div>
                </div>
            </div>

            {/* STICKY HEADER for Filters Only - Reduced Height */}
            <div className="sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur-sm py-3 -mx-8 px-8 border-b border-slate-200 shadow-sm mb-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Integrated Search/Filter for Catalog */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4 group-focus-within:text-[#121212] transition-colors" />
                          </div>
                          <input 
                            type="text"
                            placeholder={t('inv.search_placeholder')}
                            value={invSearch}
                            onChange={(e) => setInvSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-sm text-sm focus:ring-1 focus:ring-[#121212] focus:border-[#121212] outline-none transition-all placeholder:text-slate-400 font-medium"
                          />
                        </div>
                        <div className="relative min-w-[200px] group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Filter className="w-4 h-4 group-focus-within:text-[#121212] transition-colors" />
                          </div>
                          <select
                            value={invTypologyFilter}
                            onChange={(e) => setInvTypologyFilter(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm pl-10 pr-8 py-2.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#121212] focus:border-[#121212] transition-all cursor-pointer font-medium hover:border-slate-300 w-full"
                          >
                            <option value="all">{t('inv.filter.all_types')}</option>
                            {typologies.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                    </div>
                </div>
            </div>

            <CatalogView 
               typologies={filteredTypologies}
               // Pass only what's needed for display/edit since filtering is handled above
               onEditTypology={(t) => setActiveModal({ type: 'typology', data: t })}
            />
         </div>
       );
    }

    // Default: Stock View
    const filtered = stones.filter(s => {
       const isHistory = s.quantity.available === 0 && s.quantity.reserved === 0 && s.quantity.sold > 0;
       if (isHistory) return false;

       const matchesSearch = !invSearch || 
          s.typology.name.toLowerCase().includes(invSearch.toLowerCase()) || 
          s.lotId.toLowerCase().includes(invSearch.toLowerCase());
       
       const matchesType = invTypologyFilter === 'all' || s.typology.id === invTypologyFilter;
       
       const matchesStatus = invStatusFilter === 'all' || 
          (invStatusFilter === 'available' && s.quantity.available > 0) ||
          (invStatusFilter === 'reserved' && s.quantity.reserved > 0) ||
          (invStatusFilter === 'sold' && s.quantity.sold === s.quantity.total);

       return matchesSearch && matchesType && matchesStatus;
    });

    return (
      <div className="space-y-8">
         
         {/* NON-STICKY Header: Title & Actions */}
         <div className="pt-8 lg:pt-12 space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                   <h2 className="text-3xl font-serif text-[#121212] tracking-tight">{t('nav.inventory')}</h2>
                   <p className="text-slate-500 mt-2 font-light">{t('inv.your_inventory')}</p>
                </div>
                
                <div className="flex gap-4 items-center">
                    {currentUserRole === 'industry_admin' && (
                      <div className="flex bg-slate-100 p-1 rounded-sm gap-1">
                          <button 
                            onClick={() => setInventoryTab('stock')}
                            className="px-4 py-2 bg-white text-[#121212] shadow-sm text-xs font-bold uppercase tracking-widest rounded-sm"
                          >
                            {t('inv.tab.stock')}
                          </button>
                          <button 
                            onClick={() => setInventoryTab('catalog')}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#121212] transition-colors"
                          >
                            {t('inv.tab.catalog')}
                          </button>
                      </div>
                    )}

                    {currentUserRole === 'industry_admin' && (
                      <button 
                        onClick={() => setActiveModal({ type: 'batch', data: null })}
                        className="px-5 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] shadow-lg transition-all flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('inv.add_batch')}
                      </button>
                    )}
                </div>
             </div>
         </div>

         {/* STICKY HEADER for Filters Only - Reduced Height */}
         <div className="sticky top-0 z-40 bg-[#FDFDFD]/95 backdrop-blur-sm py-2 -mx-8 px-8 border-b border-slate-200 shadow-sm mb-8">
             <div className="max-w-[1600px] mx-auto">
                 <div className="mb-0">
                     <InventoryFilters 
                        searchTerm={invSearch} 
                        onSearchChange={setInvSearch} 
                        statusFilter={invStatusFilter}
                        onStatusFilterChange={setInvStatusFilter}
                        typologyFilter={invTypologyFilter} 
                        onTypologyFilterChange={setInvTypologyFilter} 
                        typologies={typologies} 
                     />
                 </div>
             </div>
         </div>

         {filtered.length === 0 ? (
            <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-lg">
               <p className="text-slate-400">{t('inv.no_results')}</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {filtered.map((stone, i) => {
                  if (currentUserRole === 'industry_admin') {
                     return (
                        <StoneCard 
                           key={stone.id} 
                           stone={stone} 
                           role="industry_admin" 
                           onClick={() => setActiveModal({ type: 'industry_inv', data: stone })} 
                           onDelegate={(s) => setActiveModal({ type: 'delegate', data: s })}
                           onDirectLink={(s) => setActiveModal({ type: 'direct', data: s })}
                           index={i}
                        />
                     );
                  } else {
                     const delegation = delegations.find(d => d.stoneId === stone.id && d.sellerId === currentSellerId);
                     if (!delegation) return null;
                     const myOffersCount = visibleOffers.filter(o => o.delegationId === delegation.id).length;
                     return (
                        <StoneCard 
                           key={stone.id} 
                           stone={stone} 
                           role="seller"
                           delegation={delegation}
                           offerCount={myOffersCount}
                           onClick={() => setActiveModal({ type: 'seller_inv', data: { stone, delegation } })}
                           onCreateOffer={(d) => setActiveModal({ type: 'offer', data: { delegation: d, stone } })}
                           index={i}
                        />
                     );
                  }
               })}
            </div>
         )}
      </div>
    );
  };

  // --- MAIN RENDER ---

  if (typeof currentView === 'object' && currentView.type === 'client_view') {
     const token = currentView.token;
     const offer = offers.find(o => o.clientViewToken === token);
     
     if (!offer) return <div>404 Not Found</div>;
     
     const stone = stones.find(s => s.id === offer.stoneId);
     const seller = offer.delegationId 
        ? sellers.find(s => s.id === delegations.find(d => d.id === offer.delegationId)?.sellerId) 
        : undefined;

     if (!stone) return <div>Stone data missing</div>;

     return (
        <ClientView 
           offer={offer} 
           stone={stone} 
           seller={seller}
           allTypologies={typologies} 
           onSwitchPersona={(r) => {
             if (r === 'client') return;
             setCurrentUserRole(r);
             setCurrentView('dashboard');
           }}
           onExit={(duration) => {
              const updatedOffers = offers.map(o => {
                 if (o.id === offer.id) {
                    return {
                       ...o,
                       viewLog: [...(o.viewLog || []), { timestamp: new Date().toISOString(), durationMs: duration }]
                    };
                 }
                 return o;
              });
              setOffers(updatedOffers);
           }}
        />
     );
  }

  // Animation config for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.99 }
  };

  const pageTransition = {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1.0] as const // Ease-out-cubic
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
       <Sidebar 
          activePage={activePage} 
          onNavigate={setActivePage} 
          role={currentUserRole}
          currentUserName={currentUser.name}
          currentUserRoleLabel={currentUser.roleLabel}
       />
       
       <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* FLOATING CONTROLS (Replacing Sticky Header) */}
          <div className="absolute top-6 right-8 z-50 flex items-center space-x-6">
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-400 hover:text-[#121212] transition-colors bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm hover:shadow-md border border-slate-100"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />
                  )}
                </button>
                {showNotifications && (
                   <NotificationDropdown 
                      notifications={notifications}
                      onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                      onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      onClose={() => setShowNotifications(false)}
                   />
                )}
             </div>

             <div className="flex items-center space-x-2 bg-slate-100/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                  onClick={() => { 
                    setCurrentUserRole('industry_admin'); 
                    setCurrentSellerId('all'); // Reset filter when switching to Admin
                    setActivePage('dashboard'); 
                  }}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${currentUserRole === 'industry_admin' ? 'bg-white shadow-sm text-[#121212]' : 'text-slate-400'}`}
                >
                  Admin
                </button>
                <button 
                  onClick={() => { 
                    setCurrentUserRole('seller'); 
                    setCurrentSellerId('sel-001'); // Force specific seller ID for Seller Role
                    setActivePage('dashboard'); 
                  }}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${currentUserRole === 'seller' ? 'bg-white shadow-sm text-[#121212]' : 'text-slate-400'}`}
                >
                  Seller
                </button>
             </div>
          </div>

          {/* SCROLL CONTAINER: Top Padding Removed (pt-0) to allow sticky header to cover */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 lg:px-12 lg:pb-12 pt-0 scroll-smooth">
             <div className="max-w-[1600px] mx-auto h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activePage}-${currentUserRole}-${inventoryTab}`}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="h-full"
                  >
                    {/* Add Top Padding Wrapper for NON-STICKY pages */}
                    {activePage === 'dashboard' && (
                       <div className="pt-8 lg:pt-12">
                           <Dashboard 
                              role={currentUserRole}
                              kpi={kpi}
                              offers={visibleOffers
                                .filter(o => stones.some(s => s.id === o.stoneId)) 
                                .map(o => ({
                                 offer: o,
                                 stone: stones.find(s => s.id === o.stoneId)!,
                                 seller: o.delegationId ? sellers.find(s => s.id === delegations.find(d => d.id === o.delegationId)?.sellerId) : undefined
                              }))}
                              sellers={sellers}
                              selectedSellerId={currentSellerId}
                              onFilterSeller={setCurrentSellerId}
                              onFinalizeSale={handleFinalizeSale}
                              onCancelLink={handleCancelLink}
                              onNavigate={setActivePage}
                              onSelectTransaction={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                              onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
                           />
                       </div>
                    )}
                    
                    {/* Inventory renders its own Sticky Header with padding included */}
                    {activePage === 'inventory' && renderInventory()}
                    
                    {/* Lot History renders its own Sticky Header with padding included */}
                    {activePage === 'lot_history' && renderLotHistory()}
                    
                    {activePage === 'thermometer' && (
                      <div className="pt-8 lg:pt-12">
                          <InterestThermometerView 
                             offers={visibleOffers.filter(o => o.status === 'active')}
                             stones={stones}
                             sellers={sellers}
                             role={currentUserRole}
                             onSelectTransaction={(item) => setActiveModal({ type: 'transaction', data: { offer: item.offer, stone: stones.find(s => s.id === item.offer.stoneId) } })}
                             onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
                          />
                      </div>
                    )}
                    
                    {(activePage === 'pipeline' || activePage === 'sales' || activePage === 'financials') && (
                       <div className="pt-8 lg:pt-12">
                           <AnalyticsDetailView 
                              title={activePage === 'pipeline' ? t('nav.pipeline') : activePage === 'sales' ? t('nav.sales') : t('nav.financials_admin')}
                              mode={activePage === 'financials' ? 'profit' : activePage === 'pipeline' ? 'pipeline' : 'sales'}
                              role={currentUserRole}
                              data={visibleOffers
                                .filter(o => {
                                   if (!stones.find(s => s.id === o.stoneId)) return false; 
                                   if (activePage === 'pipeline') return o.status === 'active';
                                   if (activePage === 'sales') return o.status === 'sold';
                                   return o.status === 'sold';
                                })
                                .map(o => ({
                                  offer: o,
                                  stone: stones.find(s => s.id === o.stoneId)!,
                                  seller: o.delegationId ? sellers.find(s => s.id === delegations.find(d => d.id === o.delegationId)?.sellerId) : undefined,
                                  delegation: delegations.find(d => d.id === o.delegationId)
                                }))
                              }
                              onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                           />
                       </div>
                    )}
                  </motion.div>
                </AnimatePresence>
             </div>
          </div>

          <ToastContainer 
            notifications={notifications.filter(n => !n.read && n.isToast)} 
            onDismiss={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))} 
          />

          {/* ... Modals (unchanged) ... */}
          {activeModal.type === 'delegate' && (
             <DelegateModal 
                stone={activeModal.data}
                sellers={sellers}
                onClose={() => setActiveModal({ type: null })}
                onConfirm={(sellerId, qty, minPrice) => handleDelegate(activeModal.data.id, sellerId, qty, minPrice)}
             />
          )}

          {activeModal.type === 'direct' && (
             <DirectLinkModal 
                stone={activeModal.data}
                onClose={() => setActiveModal({ type: null })}
                onGenerate={(price, qty, client, days) => {
                   const token = Math.random().toString(36).substring(7);
                   const newOffer: OfferLink = {
                      id: `off-${Date.now()}`,
                      stoneId: activeModal.data.id,
                      clientName: client,
                      finalPrice: price,
                      quantityOffered: qty,
                      status: 'active',
                      clientViewToken: token,
                      createdAt: new Date().toISOString(),
                      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
                      viewLog: []
                   };
                   handleCreateOffer(newOffer);
                }}
             />
          )}

          {activeModal.type === 'offer' && (
             <OfferModal 
                delegation={activeModal.data.delegation}
                stone={activeModal.data.stone}
                maxQuantity={stones.find(s => s.id === activeModal.data.stone.id)?.quantity.available || 0}
                onClose={() => setActiveModal({ type: null })}
                onSuccess={handleCreateOffer}
             />
          )}

          {activeModal.type === 'seller_inv' && (
             <SellerInventoryModal 
               delegation={activeModal.data.delegation}
               stone={activeModal.data.stone}
               offers={offers.filter(o => o.delegationId === activeModal.data.delegation.id)}
               onClose={() => setActiveModal({ type: null })}
               onCreateOffer={(d, maxQty) => setActiveModal({ type: 'offer', data: { delegation: d, stone: activeModal.data.stone } })}
               onViewTransaction={(o) => setActiveModal({ type: 'transaction', data: { offer: o, stone: activeModal.data.stone, delegation: activeModal.data.delegation } })}
               onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
             />
          )}

          {activeModal.type === 'industry_inv' && (
             <IndustryInventoryModal 
               stone={activeModal.data}
               delegations={delegations.filter(d => d.stoneId === activeModal.data.id)}
               offers={offers.filter(o => o.stoneId === activeModal.data.id)}
               sellers={sellers}
               onClose={() => setActiveModal({ type: null })}
               onViewTransaction={(o) => setActiveModal({ type: 'transaction', data: { offer: o, stone: activeModal.data } })}
               onUpdateStone={(updated) => {
                  setRawStones(prev => prev.map(s => s.id === updated.id ? updated : s));
                  setActiveModal({ type: null });
               }}
               onDelegate={() => setActiveModal({ type: 'delegate', data: activeModal.data })}
               onDirectLink={() => setActiveModal({ type: 'direct', data: activeModal.data })}
               onRevokeDelegation={handleRevokeDelegation}
               onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
             />
          )}

          {activeModal.type === 'transaction' && (
             <TransactionDetailsModal 
                transaction={activeModal.data}
                role={currentUserRole}
                onClose={() => setActiveModal({ type: null })}
                onFinalizeSale={handleFinalizeSale}
                onCancelLink={handleCancelLink}
                onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
             />
          )}

          {activeModal.type === 'typology' && (
             <TypologyModal 
               typology={activeModal.data}
               onClose={() => setActiveModal({ type: null })}
               onSave={(newType) => {
                  if (activeModal.data) {
                     setTypologies(typologies.map(t => t.id === newType.id ? newType : t));
                     setRawStones(prev => prev.map(s => s.typology.id === newType.id ? { ...s, typology: newType } : s));
                  } else {
                     setTypologies([...typologies, newType]);
                  }
                  setActiveModal({ type: null });
               }}
             />
          )}

          {activeModal.type === 'batch' && (
             <BatchModal 
               typologies={typologies}
               onClose={() => setActiveModal({ type: null })}
               onSave={(newItem) => {
                  setRawStones(prev => [newItem, ...prev]);
                  setActiveModal({ type: null });
                  addNotification(t('toast.batch_added', { id: newItem.lotId }), 'success');
               }}
             />
          )}

       </main>
    </div>
  );
};

// Wrapper App to provide Context
const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
