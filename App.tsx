import React, { useState, useMemo, useEffect } from 'react';
import { AppState, SalesDelegation, OfferLink, StoneItem, Notification, StoneTypology } from './types';
import { MOCK_STONES, MOCK_SELLERS } from './constants';
import { StoneCard } from './components/StoneCard';
import { DelegateModal } from './components/DelegateModal';
import { OfferModal } from './components/OfferModal';
import { DirectLinkModal } from './components/DirectLinkModal';
import { LinkHistoryModal } from './components/LinkHistoryModal';
import { ClientView } from './components/ClientView';
import { Dashboard } from './components/Dashboard';
import { InventoryFilters } from './components/InventoryFilters';
import { CatalogView } from './components/CatalogView';
import { TypologyModal } from './components/TypologyModal';
import { BatchModal } from './components/BatchModal';
import { AnalyticsDetailView } from './components/AnalyticsDetailView';
import { Sidebar, PageView } from './components/Sidebar';
import { CancelLinkModal } from './components/CancelLinkModal';
import { ConfirmSaleModal } from './components/ConfirmSaleModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { SellerInventoryModal } from './components/SellerInventoryModal';
import { IndustryInventoryModal } from './components/IndustryInventoryModal';
import { NotificationDropdown } from './components/NotificationDropdown';
import { ToastContainer } from './components/Toast.tsx';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Copy, CheckCircle, ExternalLink, Plus, LayoutGrid, List, Bell, Menu } from 'lucide-react';

// --- MOCK DATA INJECTION ---

const MOCK_DELEGATIONS_DATA: SalesDelegation[] = [
  {
    id: 'del-mock-1',
    stoneId: 'inv-001',
    sellerId: 'sel-001',
    delegatedQuantity: 5,
    agreedMinPrice: 2000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'del-mock-2',
    stoneId: 'inv-002',
    sellerId: 'sel-002',
    delegatedQuantity: 3,
    agreedMinPrice: 3500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

const MOCK_OFFERS_DATA: OfferLink[] = [
  {
    id: 'off-mock-1',
    delegationId: 'del-mock-1',
    stoneId: 'inv-001',
    clientName: 'Villa Toscana Project',
    finalPrice: 2800,
    quantityOffered: 2,
    status: 'sold',
    clientViewToken: 'mock-token-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    viewLog: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() }
    ]
  },
  {
    id: 'off-mock-2',
    delegationId: 'del-mock-1',
    stoneId: 'inv-001',
    clientName: 'Downtown Lofts',
    finalPrice: 2950,
    quantityOffered: 1,
    status: 'active',
    clientViewToken: 'mock-token-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    viewLog: []
  },
  {
    id: 'off-mock-3',
    delegationId: 'del-mock-2',
    stoneId: 'inv-002',
    clientName: 'Grand Hotel Lobby',
    finalPrice: 4500,
    quantityOffered: 2,
    status: 'active',
    clientViewToken: 'mock-token-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    viewLog: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() }
    ]
  },
  {
    id: 'off-mock-4',
    stoneId: 'inv-004',
    clientName: 'City Center Plaza',
    finalPrice: 1900,
    quantityOffered: 10,
    status: 'sold',
    clientViewToken: 'mock-token-4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    viewLog: [
       { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() }
    ]
  },
  {
    id: 'off-mock-5',
    stoneId: 'inv-003',
    clientName: 'Private Collector',
    finalPrice: 6500,
    quantityOffered: 1,
    status: 'active',
    clientViewToken: 'mock-token-5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    viewLog: []
  }
];

const MOCK_NOTIFICATIONS_DATA: Notification[] = [
  {
    id: 'notif-mock-1',
    recipientId: 'sel-001',
    message: 'Target detected: Downtown Lofts just opened your link for Carrara Marble!',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    isToast: false
  },
  {
    id: 'notif-mock-2',
    recipientId: 'industry',
    message: 'Sale confirmed: 10 units of Travertine Silver for City Center Plaza',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    read: true,
    isToast: false
  }
];

const getReconciledStones = (stones: StoneItem[], offers: OfferLink[], delegations: SalesDelegation[]): StoneItem[] => {
  return stones.map(stone => {
    let available = stone.quantity.total;
    let reserved = 0;
    let sold = 0;

    const directOffers = offers.filter(o => o.stoneId === stone.id && !o.delegationId);
    directOffers.forEach(o => {
      if (o.status === 'sold') {
        sold += o.quantityOffered;
        available -= o.quantityOffered;
      } else if (o.status === 'active') {
        reserved += o.quantityOffered;
        available -= o.quantityOffered;
      }
    });

    const linkedDelegations = delegations.filter(d => d.stoneId === stone.id);
    linkedDelegations.forEach(d => {
      const delOffers = offers.filter(o => o.delegationId === d.id);
      const soldQty = delOffers.filter(o => o.status === 'sold').reduce((acc, curr) => acc + curr.quantityOffered, 0);
      available -= d.delegatedQuantity; 
      sold += soldQty;
      reserved += (d.delegatedQuantity - soldQty); 
    });

    return {
      ...stone,
      quantity: {
        ...stone.quantity,
        available: Math.max(0, available),
        reserved: Math.max(0, reserved),
        sold: sold
      }
    };
  });
};

function AppContent() {
  const { t } = useLanguage();
  const [state, setState] = useState<AppState>({
    stones: MOCK_STONES,
    sellers: MOCK_SELLERS,
    delegations: MOCK_DELEGATIONS_DATA,
    offers: MOCK_OFFERS_DATA,
    notifications: MOCK_NOTIFICATIONS_DATA,
    currentUserRole: 'industry_admin',
    currentSellerId: 'sel-001',
    currentView: 'dashboard'
  });

  useEffect(() => {
    setState(prev => ({
      ...prev,
      stones: getReconciledStones(MOCK_STONES, prev.offers, prev.delegations)
    }));
  }, [state.offers, state.delegations]);

  const initialTypologies = useMemo(() => {
    const uniqueMap = new Map();
    state.stones.forEach(s => uniqueMap.set(s.typology.id, s.typology));
    return Array.from(uniqueMap.values());
  }, []);

  const [typologies, setTypologies] = useState<StoneTypology[]>(initialTypologies);
  const [activeModal, setActiveModal] = useState<{ 
    type: 'delegate' | 'offer' | 'direct_link' | 'link_history' | 'add_typology' | 'edit_typology' | 'add_batch' | 'cancel_link' | 'confirm_sale' | 'transaction_details' | 'seller_inventory' | 'industry_inventory', 
    data: any 
  } | null>(null);
  const [generatedLink, setGeneratedLink] = useState<{ url: string, token: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activePage, setActivePage] = useState<PageView>('inventory');
  const [industrySubView, setIndustrySubView] = useState<'real_inventory' | 'catalog'>('real_inventory');
  const [dashboardSellerFilter, setDashboardSellerFilter] = useState<string>('all');
  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('all');
  const [invTypologyFilter, setInvTypologyFilter] = useState('all');

  const handleDelegate = (stone: StoneItem) => {
    setActiveModal({ type: 'delegate', data: stone });
  };

  const handleDirectLink = (stone: StoneItem) => {
    setActiveModal({ type: 'direct_link', data: stone });
  };

  const handleViewHistory = (delegation: SalesDelegation) => {
    setActiveModal({ type: 'link_history', data: delegation });
  };

  const confirmDelegate = (sellerId: string, quantity: number, minPrice: number) => {
    const stoneId = activeModal?.data.id;
    const newDelegation: SalesDelegation = {
      id: `del-${Date.now()}`,
      stoneId,
      sellerId,
      delegatedQuantity: quantity,
      agreedMinPrice: minPrice,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      delegations: [...prev.delegations, newDelegation]
    }));
    setActiveModal(null);
  };

  const confirmDirectLink = (price: number, quantity: number, clientName: string, daysValid: number) => {
    const stoneId = activeModal?.data.id;
    const token = `direct-${Date.now().toString(36)}`;
    const newOffer: OfferLink = {
      id: `off-dir-${Date.now()}`,
      stoneId,
      clientName: clientName || 'Direct Client',
      finalPrice: price,
      quantityOffered: quantity,
      status: 'active',
      clientViewToken: token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString(),
      viewLog: []
    };
    setState(prev => ({
      ...prev,
      offers: [...prev.offers, newOffer]
    }));
    setGeneratedLink({ url: `https://cava.platform/view/${token}`, token });
    setActiveModal(null);
  };

  const handleCreateOffer = (delegation: SalesDelegation) => {
    setActiveModal({ type: 'offer', data: delegation });
  };

  const handleOfferSuccess = (newOffer: OfferLink) => {
    const offerWithStatus: OfferLink = { ...newOffer, status: 'active' };
    setState(prev => ({
      ...prev,
      offers: [...prev.offers, offerWithStatus]
    }));
    setGeneratedLink({ url: `https://cava.platform/view/${newOffer.clientViewToken}`, token: newOffer.clientViewToken });
    setActiveModal(null);
  };

  const handleAddTypology = () => {
    setActiveModal({ type: 'add_typology', data: null });
  };

  const handleEditTypology = (typology: StoneTypology) => {
    setActiveModal({ type: 'edit_typology', data: typology });
  };

  const handleSaveTypology = (typology: StoneTypology) => {
    const isEdit = activeModal?.type === 'edit_typology';
    if (isEdit) {
      setTypologies(prev => prev.map(t => t.id === typology.id ? typology : t));
      setState(prev => ({
        ...prev,
        stones: prev.stones.map(s => s.typology.id === typology.id ? { ...s, typology } : s)
      }));
    } else {
      setTypologies(prev => [...prev, typology]);
    }
    setActiveModal(null);
  };

  const handleAddStock = () => {
    setActiveModal({ type: 'add_batch', data: null });
  };

  const handleSaveBatch = (newItem: StoneItem) => {
    MOCK_STONES.unshift(newItem); 
    setState(prev => ({
      ...prev,
      stones: [newItem, ...prev.stones],
      notifications: [...prev.notifications, {
        id: `notif-batch-${Date.now()}`,
        recipientId: 'industry',
        message: `New Batch Added: ${newItem.quantity.total} slabs of ${newItem.typology.name} (Lot: ${newItem.lotId})`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        isToast: true
      }]
    }));
    setActiveModal(null);
  };

  const handleUpdateStone = (updatedStone: StoneItem) => {
    const index = MOCK_STONES.findIndex(s => s.id === updatedStone.id);
    if (index !== -1) {
      MOCK_STONES[index] = updatedStone;
    }
    setState(prev => ({
      ...prev,
      stones: prev.stones.map(s => s.id === updatedStone.id ? updatedStone : s)
    }));
    if (activeModal?.type === 'industry_inventory' && activeModal.data.id === updatedStone.id) {
       setActiveModal(prev => prev ? ({ ...prev, data: updatedStone }) : null);
    }
  };

  const handleRequestFinalizeSale = (offer: OfferLink) => {
    setActiveModal({ type: 'confirm_sale', data: offer });
  };

  const confirmFinalizeSale = () => {
    const offerToSell = activeModal?.data as OfferLink;
    if (!offerToSell) return;
    setState(prev => ({
      ...prev,
      offers: prev.offers.map(o => o.id === offerToSell.id ? { ...o, status: 'sold' } : o),
      notifications: [...prev.notifications, {
        id: `notif-${Date.now()}`,
        recipientId: 'industry',
        message: `Sale confirmed: ${offerToSell.quantityOffered} units for ${offerToSell.clientName}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        isToast: true
      }]
    }));
    setActiveModal(null);
  };

  const handleCancelLink = (offer: OfferLink) => {
    setActiveModal({ type: 'cancel_link', data: offer });
  };

  const confirmCancelLink = () => {
    const offerToCancel = activeModal?.data as OfferLink;
    if (!offerToCancel) return;
    setState(prev => ({
      ...prev,
      offers: prev.offers.map(o => o.id === offerToCancel.id ? { ...o, status: 'expired' } : o),
      notifications: [...prev.notifications, {
         id: `notif-cancel-${Date.now()}`,
         recipientId: prev.currentUserRole === 'industry_admin' ? 'industry' : prev.currentSellerId || 'industry',
         message: `Link cancelled for ${offerToCancel.clientName}. Stock released.`,
         type: 'alert',
         timestamp: new Date().toISOString(),
         read: false,
         isToast: true
      }]
    }));
    setActiveModal(null);
  };

  const handleDeepDive = (offer: OfferLink) => {
    setActiveModal(null);
    if (offer.status === 'sold') {
      setActivePage('sales');
    } else {
      setActivePage('pipeline');
    }
    const delegation = state.delegations.find(d => d.id === offer.delegationId);
    const stone = state.stones.find(s => s.id === (offer.stoneId || delegation?.stoneId));
    const seller = delegation ? state.sellers.find(s => s.id === delegation.sellerId) : undefined;
    if (!stone) return;
    setTimeout(() => {
      setActiveModal({
        type: 'transaction_details',
        data: { offer, stone, delegation, seller }
      });
    }, 100);
  };

  const navigateToClientView = (token: string) => {
    setState(prev => {
      const offerIndex = prev.offers.findIndex(o => o.clientViewToken === token);
      const offer = prev.offers[offerIndex];
      let notifications = prev.notifications;
      let offers = prev.offers;
      if (offer && offer.status === 'active') {
        const updatedOffer = {
          ...offer,
          viewLog: [...(offer.viewLog || []), { timestamp: new Date().toISOString() }]
        };
        offers = [...prev.offers];
        offers[offerIndex] = updatedOffer;
        let recipientId = 'industry';
        let stoneName = 'Stone';
        if (offer.delegationId) {
           const del = prev.delegations.find(d => d.id === offer.delegationId);
           if (del) recipientId = del.sellerId;
        }
        const stone = prev.stones.find(s => s.id === offer.stoneId) || 
                      prev.stones.find(s => {
                        const del = prev.delegations.find(d => d.id === offer.delegationId);
                        return del?.stoneId === s.id;
                      });
        if (stone) stoneName = stone.typology.name;
        const newNotification: Notification = {
           id: `notif-view-${Date.now()}`,
           recipientId,
           message: `Target detected: ${offer.clientName} just opened your link for ${stoneName}!`,
           type: 'info',
           timestamp: new Date().toISOString(),
           read: false,
           isToast: true
        };
        notifications = [...notifications, newNotification];
      }
      return { 
        ...prev, 
        offers,
        notifications,
        currentView: { type: 'client_view', token } 
      };
    });
  };

  const navigateHome = () => {
    setState(prev => ({ ...prev, currentView: 'dashboard' }));
  };

  const dismissToast = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isToast: false } : n)
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  };

  const markAllNotificationsAsRead = () => {
     setState(prev => {
       const userNotifs = prev.notifications.filter(n => {
         if (prev.currentUserRole === 'industry_admin') return true;
         return n.recipientId === prev.currentSellerId;
       });
       const idsToMark = new Set(userNotifs.map(n => n.id));
       return {
         ...prev,
         notifications: prev.notifications.map(n => idsToMark.has(n.id) ? { ...n, read: true } : n)
       };
     });
  };

  const simulateClientView = () => {
    const activeOffer = state.offers.find(o => o.status === 'active');
    if (activeOffer) {
      navigateToClientView(activeOffer.clientViewToken);
    } else {
       const anyOffer = state.offers[0];
       if (anyOffer) navigateToClientView(anyOffer.clientViewToken);
    }
  };

  const handleSelectTransaction = (transaction: any) => {
     setActiveModal({ type: 'transaction_details', data: transaction });
  };

  const dashboardData = useMemo(() => {
    let filteredOffers = state.offers;
    if (state.currentUserRole === 'industry_admin') {
       if (dashboardSellerFilter !== 'all') {
         filteredOffers = filteredOffers.filter(o => {
           if (!o.delegationId) return false;
           const delegation = state.delegations.find(d => d.id === o.delegationId);
           return delegation?.sellerId === dashboardSellerFilter;
         });
       }
    } else {
       filteredOffers = filteredOffers.filter(o => {
         if (!o.delegationId) return false;
         const delegation = state.delegations.find(d => d.id === o.delegationId);
         return delegation?.sellerId === state.currentSellerId;
       });
    }
    const enrichedOffers = filteredOffers.map(offer => {
       const delegation = state.delegations.find(d => d.id === offer.delegationId);
       const stoneId = offer.stoneId || delegation?.stoneId;
       const stone = state.stones.find(s => s.id === stoneId)!;
       const seller = delegation ? state.sellers.find(s => s.id === delegation.sellerId) : undefined;
       return { offer, stone, delegation, seller };
    });
    let pipelineRevenue = 0;
    let soldRevenue = 0;
    let totalProfit = 0;
    enrichedOffers.forEach(({ offer, stone, delegation }) => {
      const revenue = offer.finalPrice * offer.quantityOffered;
      if (offer.status === 'sold') {
        soldRevenue += revenue;
        if (state.currentUserRole === 'industry_admin') {
           totalProfit += (offer.finalPrice - stone.baseCost) * offer.quantityOffered;
        } else {
           const costBasis = delegation?.agreedMinPrice || 0;
           totalProfit += (offer.finalPrice - costBasis) * offer.quantityOffered;
        }
      } else if (offer.status === 'active') {
        pipelineRevenue += revenue;
      }
    });
    return {
      metrics: {
        pipelineRevenue,
        soldRevenue,
        totalProfit,
        labelProfit: state.currentUserRole === 'industry_admin' ? t('dash.kpi.profit_admin') : t('dash.kpi.profit_seller')
      },
      rows: enrichedOffers
    };
  }, [state.offers, state.delegations, state.stones, state.sellers, state.currentUserRole, state.currentSellerId, dashboardSellerFilter, t]);

  if (typeof state.currentView === 'object' && state.currentView.type === 'client_view') {
    const token = state.currentView.token;
    const offer = state.offers.find(o => o.clientViewToken === token);
    if (!offer) return <div className="p-8 text-center">Offer not found or expired. <button onClick={navigateHome} className="underline">Go Home</button></div>;
    const stone = state.stones.find(s => s.id === offer.stoneId) || 
                  state.stones.find(s => {
                    const del = state.delegations.find(d => d.id === offer.delegationId);
                    return del?.stoneId === s.id;
                  });
    if (!stone) return <div>Stone data missing.</div>;
    const seller = state.sellers.find(s => {
       if (offer.delegationId) {
          const del = state.delegations.find(d => d.id === offer.delegationId);
          return del?.sellerId === s.id;
       }
       return false;
    });
    return (
      <>
        <div className="relative">
            <ClientView offer={offer} stone={stone} seller={seller} />
        </div>
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-slate-200 z-50 flex items-center space-x-1 animate-in slide-in-from-bottom-10 fade-in duration-500">
             <div className="pl-3 pr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200/50 mr-1">
               {t('header.demo')}
             </div>
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'industry_admin', currentView: 'dashboard' })); setActivePage('inventory'); }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {t('role.industry')}
              </button>
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'seller', currentView: 'dashboard' })); setActivePage('inventory'); }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {t('role.seller')}
              </button>
              <button 
                className="px-4 py-2 rounded-full text-xs font-medium transition-all bg-slate-900 text-white shadow-md cursor-default"
              >
                {t('role.client')}
              </button>
        </div>
      </>
    );
  }

  const getAnalyticsData = (mode: 'pipeline' | 'sales' | 'profit') => {
    if (mode === 'pipeline') {
      return dashboardData.rows.filter(r => r.offer.status === 'active');
    }
    return dashboardData.rows.filter(r => r.offer.status === 'sold');
  };

  const renderMainContent = () => {
    switch (activePage) {
      case 'inventory':
        return renderInventory();
      case 'dashboard':
        return (
          <Dashboard 
            role={state.currentUserRole}
            kpi={dashboardData.metrics}
            offers={dashboardData.rows}
            sellers={state.sellers}
            selectedSellerId={dashboardSellerFilter}
            onFilterSeller={setDashboardSellerFilter}
            onFinalizeSale={handleRequestFinalizeSale}
            onCancelLink={handleCancelLink}
            onNavigate={setActivePage}
            onSelectTransaction={handleSelectTransaction}
          />
        );
      case 'pipeline':
        return (
          <AnalyticsDetailView
            title={t('nav.pipeline')}
            mode="pipeline"
            data={getAnalyticsData('pipeline')}
            role={state.currentUserRole}
            onTransactionClick={handleSelectTransaction}
          />
        );
      case 'sales':
        return (
          <AnalyticsDetailView
            title={t('nav.sales')}
            mode="sales"
            data={getAnalyticsData('sales')}
            role={state.currentUserRole}
            onTransactionClick={handleSelectTransaction}
          />
        );
      case 'financials':
        return (
          <AnalyticsDetailView
            title={state.currentUserRole === 'industry_admin' ? t('nav.financials_admin') : t('nav.financials_seller')}
            mode="profit"
            data={getAnalyticsData('profit')}
            role={state.currentUserRole}
            onTransactionClick={handleSelectTransaction}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  const renderInventory = () => {
    if (state.currentUserRole === 'industry_admin') {
      const filteredStones = state.stones.filter(stone => {
        const matchesSearch = invSearch 
           ? stone.lotId.toLowerCase().includes(invSearch.toLowerCase()) || stone.typology.name.toLowerCase().includes(invSearch.toLowerCase())
           : true;
        let matchesStatus = true;
        if (invStatusFilter === 'available') matchesStatus = stone.quantity.available > 0;
        if (invStatusFilter === 'sold') matchesStatus = stone.quantity.available === 0 && stone.quantity.sold > 0;
        if (invStatusFilter === 'reserved') matchesStatus = stone.quantity.reserved > 0;
        const matchesTypology = invTypologyFilter !== 'all' ? stone.typology.id === invTypologyFilter : true;
        return matchesSearch && matchesStatus && matchesTypology;
      });
      return (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
             <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
                <button 
                  onClick={() => setIndustrySubView('real_inventory')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${industrySubView === 'real_inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  {t('inv.tab.stock')}
                </button>
                <button 
                  onClick={() => setIndustrySubView('catalog')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${industrySubView === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4 mr-2" />
                  {t('inv.tab.catalog')}
                </button>
             </div>
          </div>
          {industrySubView === 'real_inventory' ? (
            <>
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900">{t('inv.physical_stock')}</h2>
                 <button 
                   onClick={handleAddStock}
                   className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                 >
                   <Plus className="w-4 h-4 mr-2" />
                   {t('inv.add_batch')}
                 </button>
               </div>
               <InventoryFilters 
                 searchTerm={invSearch}
                 onSearchChange={setInvSearch}
                 statusFilter={invStatusFilter}
                 onStatusFilterChange={setInvStatusFilter}
                 typologyFilter={invTypologyFilter}
                 onTypologyFilterChange={setInvTypologyFilter}
                 typologies={typologies}
               />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                 {filteredStones.map(stone => (
                   <StoneCard 
                     key={stone.id} 
                     stone={stone} 
                     role="industry_admin"
                     onDelegate={handleDelegate}
                     onDirectLink={handleDirectLink}
                     onClick={() => setActiveModal({ type: 'industry_inventory', data: stone })}
                   />
                 ))}
                 {filteredStones.length === 0 && (
                   <div className="col-span-full py-12 text-center text-slate-400">
                     {t('inv.no_results')}
                   </div>
                 )}
               </div>
            </>
          ) : (
            <CatalogView 
              typologies={typologies} 
              onAddTypology={handleAddTypology}
              onEditTypology={handleEditTypology}
            />
          )}
        </div>
      );
    } else {
      const myDelegations = state.delegations.filter(d => d.sellerId === state.currentSellerId);
      return (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-slate-900">{t('inv.your_inventory')}</h2>
          </div>
          {myDelegations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">{t('inv.no_stones')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myDelegations.map(delegation => {
                const stone = state.stones.find(s => s.id === delegation.stoneId);
                if (!stone) return null;
                const offerCount = state.offers.filter(o => o.delegationId === delegation.id).length;
                return (
                  <StoneCard 
                    key={delegation.id}
                    stone={stone}
                    role="seller"
                    delegation={delegation}
                    offerCount={offerCount}
                    onCreateOffer={handleCreateOffer}
                    onViewHistory={handleViewHistory}
                    onClick={() => setActiveModal({ type: 'seller_inventory', data: delegation })}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    }
  };

  const relevantNotifications = state.notifications.filter(n => {
    if (state.currentUserRole === 'industry_admin') return true; 
    return n.recipientId === state.currentSellerId;
  });

  const activeToasts = relevantNotifications.filter(n => n.isToast);
  const unreadCount = relevantNotifications.filter(n => !n.read).length;
  const currentUserName = state.currentUserRole === 'industry_admin' ? 'HQ Admin' : 'John Stone';
  const currentUserRoleLabel = state.currentUserRole === 'industry_admin' ? t('role.industry') : t('role.seller');

  let offerModalMaxQty = 0;
  if (activeModal?.type === 'offer') {
    const delegation = activeModal.data as SalesDelegation;
    const delegationOffers = state.offers.filter(o => o.delegationId === delegation.id);
    const consumed = delegationOffers.filter(o => o.status === 'sold' || o.status === 'active').reduce((acc, curr) => acc + curr.quantityOffered, 0);
    offerModalMaxQty = delegation.delegatedQuantity - consumed;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative flex">
      <ToastContainer notifications={activeToasts} onDismiss={dismissToast} />
      <Sidebar 
         activePage={activePage} 
         onNavigate={setActivePage} 
         role={state.currentUserRole}
         currentUserName={currentUserName}
         currentUserRoleLabel={currentUserRoleLabel}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 lg:hidden shrink-0">
          <div className="px-4 h-16 flex justify-between items-center">
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                 <span className="text-white font-bold text-lg">C</span>
               </div>
               <span className="text-xl font-bold tracking-tight text-slate-900">CAVA</span>
             </div>
             <div className="flex items-center gap-3">
               <LanguageSwitcher />
               <button className="p-2 text-slate-500">
                 <Menu className="w-6 h-6" />
               </button>
             </div>
          </div>
        </header>
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 hidden lg:flex items-center justify-between px-8">
           <div className="text-sm text-slate-500">
              {t('header.welcome')} <span className="font-semibold text-slate-900">{currentUserName}</span>
           </div>
           <div className="flex items-center bg-slate-100 rounded-full p-1 mx-4">
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'industry_admin' })); setActivePage('inventory'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${state.currentUserRole === 'industry_admin' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('role.industry')}
              </button>
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'seller' })); setActivePage('inventory'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${state.currentUserRole === 'seller' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('role.seller')}
              </button>
              <button 
                onClick={simulateClientView}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all text-slate-500 hover:text-slate-700`}
              >
                {t('role.client')}
              </button>
           </div>
           <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown 
                    notifications={relevantNotifications}
                    onMarkRead={markNotificationAsRead}
                    onMarkAllRead={markAllNotificationsAsRead}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
             {renderMainContent()}
          </div>
        </main>
      </div>
      {activeModal?.type === 'delegate' && (
        <DelegateModal 
          stone={activeModal.data as StoneItem} 
          sellers={state.sellers}
          onClose={() => setActiveModal(null)}
          onConfirm={confirmDelegate}
        />
      )}
      {activeModal?.type === 'offer' && (
        <OfferModal
          delegation={activeModal.data as SalesDelegation}
          stone={state.stones.find(s => s.id === (activeModal.data as SalesDelegation).stoneId)!}
          maxQuantity={offerModalMaxQty}
          onClose={() => setActiveModal(null)}
          onSuccess={handleOfferSuccess}
        />
      )}
      {activeModal?.type === 'direct_link' && (
        <DirectLinkModal 
          stone={activeModal.data as StoneItem}
          onClose={() => setActiveModal(null)}
          onGenerate={confirmDirectLink}
        />
      )}
      {activeModal?.type === 'link_history' && (
        <LinkHistoryModal
          delegation={activeModal.data as SalesDelegation}
          stone={state.stones.find(s => s.id === (activeModal.data as SalesDelegation).stoneId)!}
          offers={state.offers.filter(o => o.delegationId === (activeModal.data as SalesDelegation).id)}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === 'seller_inventory' && (
        <SellerInventoryModal
          delegation={activeModal.data as SalesDelegation}
          stone={state.stones.find(s => s.id === (activeModal.data as SalesDelegation).stoneId)!}
          offers={state.offers.filter(o => o.delegationId === (activeModal.data as SalesDelegation).id)}
          onClose={() => setActiveModal(null)}
          onCreateOffer={() => {
             const currentData = activeModal.data;
             setActiveModal(null);
             setTimeout(() => setActiveModal({ type: 'offer', data: currentData }), 50);
          }}
          onViewTransaction={handleDeepDive}
        />
      )}
      {activeModal?.type === 'industry_inventory' && (
        <IndustryInventoryModal
          stone={activeModal.data as StoneItem}
          delegations={state.delegations.filter(d => d.stoneId === (activeModal.data as StoneItem).id)}
          offers={state.offers.filter(o => {
            if (o.stoneId === (activeModal.data as StoneItem).id) return true;
            const del = state.delegations.find(d => d.id === o.delegationId);
            return del?.stoneId === (activeModal.data as StoneItem).id;
          })}
          sellers={state.sellers}
          onClose={() => setActiveModal(null)}
          onViewTransaction={handleDeepDive}
          onUpdateStone={handleUpdateStone}
          onDelegate={() => {
             const stone = activeModal.data as StoneItem;
             setActiveModal(null);
             setTimeout(() => handleDelegate(stone), 0);
          }}
          onDirectLink={() => {
             const stone = activeModal.data as StoneItem;
             setActiveModal(null);
             setTimeout(() => handleDirectLink(stone), 0);
          }}
        />
      )}
      {(activeModal?.type === 'add_typology' || activeModal?.type === 'edit_typology') && (
        <TypologyModal 
          typology={activeModal.data as StoneTypology}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveTypology}
        />
      )}
      {activeModal?.type === 'add_batch' && (
        <BatchModal
          typologies={typologies}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveBatch}
        />
      )}
      {activeModal?.type === 'transaction_details' && (
        <TransactionDetailsModal
          transaction={activeModal.data}
          role={state.currentUserRole}
          onClose={() => setActiveModal(null)}
          onFinalizeSale={(offer) => {
            setActiveModal(null);
            handleRequestFinalizeSale(offer);
          }}
          onCancelLink={(offer) => {
            setActiveModal(null);
            handleCancelLink(offer);
          }}
        />
      )}
      {activeModal?.type === 'cancel_link' && (
        <CancelLinkModal
          offer={activeModal.data}
          stone={
            state.stones.find(s => s.id === activeModal.data.stoneId) ||
            state.stones.find(s => {
              const del = state.delegations.find(d => d.id === activeModal.data.delegationId);
              return del?.stoneId === s.id;
            })!
          }
          onClose={() => setActiveModal(null)}
          onConfirm={confirmCancelLink}
        />
      )}
      {activeModal?.type === 'confirm_sale' && (
        <ConfirmSaleModal
          offer={activeModal.data}
          stone={
            state.stones.find(s => s.id === activeModal.data.stoneId) ||
            state.stones.find(s => {
              const del = state.delegations.find(d => d.id === activeModal.data.delegationId);
              return del?.stoneId === s.id;
            })!
          }
          onClose={() => setActiveModal(null)}
          onConfirm={confirmFinalizeSale}
        />
      )}
      {generatedLink && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-lg shadow-2xl flex flex-col space-y-3 w-80">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <CheckCircle className="w-5 h-5" />
              <span>{t('toast.link_ready')}</span>
            </div>
            <div className="bg-slate-800 p-2 rounded text-xs font-mono break-all text-slate-300">
              {generatedLink.url}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink.url);
                  alert(t('toast.copied'));
                }}
                className="flex items-center justify-center py-2 bg-white text-slate-900 rounded text-sm font-bold hover:bg-slate-100"
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('toast.copy')}
              </button>
              <button 
                onClick={() => {
                   navigateToClientView(generatedLink.token);
                   setGeneratedLink(null);
                }}
                className="flex items-center justify-center py-2 bg-slate-700 text-white rounded text-sm font-bold hover:bg-slate-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('toast.view')}
              </button>
            </div>
            <button 
              onClick={() => setGeneratedLink(null)} 
              className="text-xs text-slate-500 hover:text-slate-300 underline text-center"
            >
              {t('toast.dismiss')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}