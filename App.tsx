import React, { useState, useMemo, useEffect } from 'react';
import { AppState, SalesDelegation, OfferLink, StoneItem, Notification, StoneTypology, UserRole } from './types';
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
import { Copy, CheckCircle, ExternalLink, Plus, LayoutGrid, List, Bell, Menu, Archive, FilterX } from 'lucide-react';

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
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), durationMs: 45000 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), durationMs: 120000 }
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
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), durationMs: 30000 }
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
       { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), durationMs: 250000 }
    ]
  },
  {
    id: 'off-mock-5',
    stoneId: 'inv-005',
    clientName: 'Residencial Aurora',
    finalPrice: 2500,
    quantityOffered: 8,
    status: 'sold',
    clientViewToken: 'mock-token-hist-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    viewLog: [
       { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(), durationMs: 600000 }
    ]
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
    notifications: [],
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

  const [typologies, setTypologies] = useState<StoneTypology[]>([]);
  useEffect(() => {
    const uniqueMap = new Map();
    state.stones.forEach(s => uniqueMap.set(s.typology.id, s.typology));
    setTypologies(Array.from(uniqueMap.values()));
  }, [state.stones]);

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
  const [catSearch, setCatSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('all');
  const [invTypologyFilter, setInvTypologyFilter] = useState('all');
  const [catTypologyFilter, setCatTypologyFilter] = useState('all');

  const handleDelegate = (stone: StoneItem) => setActiveModal({ type: 'delegate', data: stone });
  const handleDirectLink = (stone: StoneItem) => setActiveModal({ type: 'direct_link', data: stone });
  const handleViewHistory = (delegation: SalesDelegation) => setActiveModal({ type: 'link_history', data: delegation });

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
    setState(prev => ({ ...prev, offers: [...prev.offers, newOffer] }));
    setGeneratedLink({ url: `https://cava.platform/view/${token}`, token });
    setActiveModal(null);
  };

  const handleCreateOffer = (delegation: SalesDelegation) => setActiveModal({ type: 'offer', data: delegation });

  const handleOfferSuccess = (newOffer: OfferLink) => {
    const offerWithStatus: OfferLink = { ...newOffer, status: 'active' };
    setState(prev => ({ ...prev, offers: [...prev.offers, offerWithStatus] }));
    setGeneratedLink({ url: `https://cava.platform/view/${newOffer.clientViewToken}`, token: newOffer.clientViewToken });
    setActiveModal(null);
  };

  const handleAddTypology = () => setActiveModal({ type: 'add_typology', data: null });
  const handleEditTypology = (typology: StoneTypology) => setActiveModal({ type: 'edit_typology', data: typology });

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

  const handleAddStock = () => setActiveModal({ type: 'add_batch', data: null });

  const handleSaveBatch = (newItem: StoneItem) => {
    setState(prev => ({
      ...prev,
      stones: [newItem, ...prev.stones],
      notifications: [...prev.notifications, {
        id: `notif-batch-${Date.now()}`,
        recipientId: 'industry',
        message: `Novo Lote Adicionado: ${newItem.quantity.total} chapas de ${newItem.typology.name}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        isToast: true
      }]
    }));
    setActiveModal(null);
  };

  const handleUpdateStone = (updatedStone: StoneItem) => {
    setState(prev => ({
      ...prev,
      stones: prev.stones.map(s => s.id === updatedStone.id ? updatedStone : s)
    }));
  };

  const handleRequestFinalizeSale = (offer: OfferLink) => setActiveModal({ type: 'confirm_sale', data: offer });

  const confirmFinalizeSale = () => {
    const offerToSell = activeModal?.data as OfferLink;
    if (!offerToSell) return;
    setState(prev => ({
      ...prev,
      offers: prev.offers.map(o => o.id === offerToSell.id ? { ...o, status: 'sold' } : o),
      notifications: [...prev.notifications, {
        id: `notif-${Date.now()}`,
        recipientId: 'industry',
        message: `Venda confirmada: ${offerToSell.quantityOffered} unidades para ${offerToSell.clientName}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        isToast: true
      }]
    }));
    setActiveModal(null);
  };

  const handleCancelLink = (offer: OfferLink) => setActiveModal({ type: 'cancel_link', data: offer });

  const confirmCancelLink = () => {
    const offerToCancel = activeModal?.data as OfferLink;
    if (!offerToCancel) return;
    setState(prev => ({
      ...prev,
      offers: prev.offers.map(o => o.id === offerToCancel.id ? { ...o, status: 'expired' } : o)
    }));
    setActiveModal(null);
  };

  const handleSelectTransaction = (transaction: any) => {
    setActiveModal({ type: 'transaction_details', data: transaction });
  };

  const handleDeepDive = (offer: OfferLink) => {
    setActiveModal(null);
    if (offer.status === 'sold') setActivePage('sales');
    else setActivePage('pipeline');
    
    const delegation = state.delegations.find(d => d.id === offer.delegationId);
    const stone = state.stones.find(s => s.id === (offer.stoneId || delegation?.stoneId));
    const seller = delegation ? state.sellers.find(s => s.id === delegation.sellerId) : undefined;
    
    if (!stone) return;
    setTimeout(() => {
      setActiveModal({ type: 'transaction_details', data: { offer, stone, delegation, seller } });
    }, 100);
  };

  const navigateToClientView = (token: string) => {
    setState(prev => {
      const offerIndex = prev.offers.findIndex(o => o.clientViewToken === token);
      const offer = prev.offers[offerIndex];
      let notifications = [...prev.notifications];
      let offers = [...prev.offers];
      
      if (offer && offer.status === 'active') {
        const updatedOffer = {
          ...offer,
          viewLog: [...(offer.viewLog || []), { timestamp: new Date().toISOString() }]
        };
        offers[offerIndex] = updatedOffer;
        
        let recipientId = 'industry';
        if (offer.delegationId) {
           const del = prev.delegations.find(d => d.id === offer.delegationId);
           if (del) recipientId = del.sellerId;
        }
        
        const stone = prev.stones.find(s => s.id === offer.stoneId) || 
                      prev.stones.find(s => {
                        const del = prev.delegations.find(d => d.id === offer.delegationId);
                        return del?.stoneId === s.id;
                      });
                      
        // Evitamos disparar múltiplas notificações de visualização em um curto período para o mesmo token
        const lastViewNotif = notifications.filter(n => n.id.startsWith('notif-view-')).pop();
        const isSpam = lastViewNotif && (Date.now() - new Date(lastViewNotif.timestamp).getTime() < 5000);

        if (!isSpam) {
            notifications.push({
               id: `notif-view-${Date.now()}`,
               recipientId,
               message: `Atenção: ${offer.clientName} acabou de abrir sua oferta de ${stone?.typology.name || 'Pedra'}!`,
               type: 'info',
               timestamp: new Date().toISOString(),
               read: false,
               isToast: true
            });
        }
      }
      return { ...prev, offers, notifications, currentView: { type: 'client_view', token } };
    });
  };

  const handleClientViewExit = (durationMs: number) => {
    const currentView = state.currentView;
    if (typeof currentView !== 'object' || currentView.type !== 'client_view') return;
    
    const token = currentView.token;
    setState(prev => {
      const offerIndex = prev.offers.findIndex(o => o.clientViewToken === token);
      if (offerIndex === -1) return prev;
      
      const updatedOffers = [...prev.offers];
      const offer = updatedOffers[offerIndex];
      const updatedViewLog = [...offer.viewLog];
      
      if (updatedViewLog.length > 0) {
        updatedViewLog[updatedViewLog.length - 1].durationMs = durationMs;
      }
      
      updatedOffers[offerIndex] = { ...offer, viewLog: updatedViewLog };

      let recipientId = 'industry';
      if (offer.delegationId) {
         const del = prev.delegations.find(d => d.id === offer.delegationId);
         if (del) recipientId = del.sellerId;
      }

      const durationSec = Math.round(durationMs / 1000);
      const timeStr = durationSec > 60 ? `${Math.floor(durationSec/60)}min ${durationSec%60}s` : `${durationSec}s`;

      return { 
        ...prev, 
        offers: updatedOffers,
        notifications: [...prev.notifications, {
          id: `notif-duration-${Date.now()}`,
          recipientId,
          message: `Engajamento: ${offer.clientName} passou ${timeStr} analisando sua proposta.`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          isToast: true
        }]
      };
    });
  };

  const navigateHome = () => setState(prev => ({ ...prev, currentView: 'dashboard' }));

  const dashboardData = useMemo(() => {
    let filteredOffers = state.offers;
    if (state.currentUserRole === 'industry_admin') {
       if (dashboardSellerFilter !== 'all') {
         filteredOffers = filteredOffers.filter(o => {
           const delegation = state.delegations.find(d => d.id === o.delegationId);
           return delegation?.sellerId === dashboardSellerFilter;
         });
       }
    } else {
       filteredOffers = filteredOffers.filter(o => {
         const delegation = state.delegations.find(d => d.id === o.delegationId);
         return delegation?.sellerId === state.currentSellerId;
       });
    }
    const enriched = filteredOffers.map(offer => {
       const delegation = state.delegations.find(d => d.id === offer.delegationId);
       const stoneId = offer.stoneId || delegation?.stoneId;
       const stone = state.stones.find(s => s.id === stoneId)!;
       const seller = delegation ? state.sellers.find(s => s.id === delegation.sellerId) : undefined;
       return { offer, stone, delegation, seller };
    });
    
    let pipelineRevenue = 0;
    let soldRevenue = 0;
    let totalProfit = 0;
    
    enriched.forEach(({ offer, stone, delegation }) => {
      const revenue = offer.finalPrice * offer.quantityOffered;
      if (offer.status === 'sold') {
        soldRevenue += revenue;
        const costBasis = state.currentUserRole === 'industry_admin' ? stone.baseCost : (delegation?.agreedMinPrice || 0);
        totalProfit += (offer.finalPrice - costBasis) * offer.quantityOffered;
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
      rows: enriched
    };
  }, [state.offers, state.delegations, state.stones, state.currentUserRole, dashboardSellerFilter, t]);

  const handleSwitchPersona = (role: UserRole | 'client') => {
    if (role === 'client') {
      const active = state.offers.find(o => o.status === 'active');
      if (active) navigateToClientView(active.clientViewToken);
    } else {
      setState(s => ({ ...s, currentUserRole: role, currentView: 'dashboard' }));
      setActivePage('inventory');
    }
  };

  if (typeof state.currentView === 'object' && state.currentView.type === 'client_view') {
    const offer = state.offers.find(o => o.clientViewToken === (state.currentView as any).token)!;
    const delegation = state.delegations.find(d => d.id === offer.delegationId);
    const stone = state.stones.find(s => s.id === (offer.stoneId || delegation?.stoneId))!;
    const seller = delegation ? state.sellers.find(s => s.id === delegation.sellerId) : undefined;
    
    return (
      <ClientView 
        offer={offer} 
        stone={stone} 
        seller={seller} 
        onExit={(duration) => {
          handleClientViewExit(duration);
        }}
        onSwitchPersona={handleSwitchPersona}
      />
    );
  }

  const renderInventory = () => {
    if (state.currentUserRole === 'industry_admin') {
      const activeStones = state.stones.filter(s => s.quantity.available > 0 || s.quantity.reserved > 0);
      
      const filteredStones = activeStones.filter(stone => {
        const matchesSearch = !invSearch || stone.lotId.toLowerCase().includes(invSearch.toLowerCase()) || stone.typology.name.toLowerCase().includes(invSearch.toLowerCase());
        let matchesStatus = true;
        if (invStatusFilter === 'available') matchesStatus = stone.quantity.available > 0;
        if (invStatusFilter === 'sold') matchesStatus = stone.quantity.available === 0 && stone.quantity.sold > 0;
        const matchesTypology = invTypologyFilter === 'all' || stone.typology.id === invTypologyFilter;
        return matchesSearch && matchesStatus && matchesTypology;
      });

      const filteredTypologies = typologies.filter(type => {
        const matchesSearch = !catSearch || type.name.toLowerCase().includes(catSearch.toLowerCase()) || type.origin.toLowerCase().includes(catSearch.toLowerCase());
        const matchesTypology = catTypologyFilter === 'all' || type.id === catTypologyFilter;
        return matchesSearch && matchesTypology;
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
             <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
                <button onClick={() => setIndustrySubView('real_inventory')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${industrySubView === 'real_inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  <LayoutGrid className="w-4 h-4 mr-2" /> {t('inv.tab.stock')}
                </button>
                <button onClick={() => setIndustrySubView('catalog')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${industrySubView === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  <List className="w-4 h-4 mr-2" /> {t('inv.tab.catalog')}
                </button>
             </div>
          </div>
          {industrySubView === 'real_inventory' ? (
            <>
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900">{t('inv.physical_stock')}</h2>
                 <button onClick={handleAddStock} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4 mr-2" /> {t('inv.add_batch')}</button>
               </div>
               <InventoryFilters searchTerm={invSearch} onSearchChange={setInvSearch} statusFilter={invStatusFilter} onStatusFilterChange={setInvStatusFilter} typologyFilter={invTypologyFilter} onTypologyFilterChange={setInvTypologyFilter} typologies={typologies} />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredStones.map(stone => (
                   <StoneCard key={stone.id} stone={stone} role="industry_admin" onDelegate={handleDelegate} onDirectLink={handleDirectLink} onClick={() => setActiveModal({ type: 'industry_inventory', data: stone })} />
                 ))}
               </div>
            </>
          ) : (
            <CatalogView 
              typologies={filteredTypologies} 
              fullTypologyList={typologies}
              searchTerm={catSearch} 
              onSearchChange={setCatSearch} 
              typologyFilter={catTypologyFilter}
              onTypologyFilterChange={setCatTypologyFilter}
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
          <h2 className="text-xl font-bold text-slate-900 mb-6">{t('inv.your_inventory')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myDelegations.map(delegation => {
              const stone = state.stones.find(s => s.id === delegation.stoneId)!;
              const offerCount = state.offers.filter(o => o.delegationId === delegation.id).length;
              return (
                <StoneCard key={delegation.id} stone={stone} role="seller" delegation={delegation} offerCount={offerCount} onCreateOffer={handleCreateOffer} onViewHistory={handleViewHistory} onClick={() => setActiveModal({ type: 'seller_inventory', data: delegation })} />
              );
            })}
          </div>
        </div>
      );
    }
  };

  const renderLotHistory = () => {
    const historyStones = state.stones.filter(s => s.quantity.available === 0 && s.quantity.reserved === 0 && s.quantity.sold > 0);
    
    const filteredStones = historyStones.filter(stone => {
      const matchesSearch = !invSearch || stone.lotId.toLowerCase().includes(invSearch.toLowerCase()) || stone.typology.name.toLowerCase().includes(invSearch.toLowerCase());
      const matchesTypology = invTypologyFilter === 'all' || stone.typology.id === invTypologyFilter;
      return matchesSearch && matchesTypology;
    });

    const isFilterActive = invSearch || invTypologyFilter !== 'all';

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 flex items-center">
             <Archive className="w-6 h-6 mr-2 text-slate-500" />
             {t('inv.history_title')}
           </h2>
           <p className="text-sm text-slate-500 mt-1">{t('inv.history_subtitle')}</p>
        </div>

        {historyStones.length > 0 && (
          <InventoryFilters 
             searchTerm={invSearch} 
             onSearchChange={setInvSearch} 
             statusFilter="sold" 
             onStatusFilterChange={() => {}} 
             typologyFilter={invTypologyFilter} 
             onTypologyFilterChange={setInvTypologyFilter} 
             typologies={typologies} 
          />
        )}

        {historyStones.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
            <Archive className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">{t('inv.history_empty')}</p>
          </div>
        ) : filteredStones.length === 0 && isFilterActive ? (
          <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
            <FilterX className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">{t('inv.no_results')}</p>
            <button 
              onClick={() => { setInvSearch(''); setInvTypologyFilter('all'); }}
              className="mt-4 text-sm font-bold text-blue-600 hover:underline"
            >
              {t('common.clear')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStones.map(stone => (
              <StoneCard 
                key={stone.id} 
                stone={stone} 
                role="industry_admin" 
                onClick={() => setActiveModal({ type: 'industry_inventory', data: stone })} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const getAnalyticsTitle = (page: PageView) => {
    if (page === 'financials') {
       return state.currentUserRole === 'industry_admin' ? t('nav.financials_admin') : t('nav.financials_seller');
    }
    return t(`nav.${page}`);
  };

  const currentUserName = state.currentUserRole === 'industry_admin' ? 'HQ Admin' : 'John Stone';
  const currentUserRoleLabel = state.currentUserRole === 'industry_admin' ? t('role.industry') : t('role.seller');
  const relevantNotifs = state.notifications.filter(n => state.currentUserRole === 'industry_admin' || n.recipientId === state.currentSellerId);
  const unreadCount = relevantNotifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative flex">
      <ToastContainer notifications={relevantNotifs.filter(n => n.isToast)} onDismiss={id => setState(p => ({ ...p, notifications: p.notifications.map(n => n.id === id ? { ...n, isToast: false } : n) }))} />
      <Sidebar activePage={activePage} onNavigate={setActivePage} role={state.currentUserRole} currentUserName={currentUserName} currentUserRoleLabel={currentUserRoleLabel} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-8">
           <div className="text-sm text-slate-500">{t('header.welcome')} <span className="font-semibold text-slate-900">{currentUserName}</span></div>
           <div className="flex items-center bg-slate-100 rounded-full p-1 mx-4">
              <button onClick={() => handleSwitchPersona('industry_admin')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${state.currentUserRole === 'industry_admin' && state.currentView === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t('role.industry')}</button>
              <button onClick={() => handleSwitchPersona('seller')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${state.currentUserRole === 'seller' && state.currentView === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t('role.seller')}</button>
              <button onClick={() => handleSwitchPersona('client')} className={`px-4 py-1.5 rounded-full text-xs font-medium ${typeof state.currentView === 'object' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t('role.client')}</button>
           </div>
           <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>}
                </button>
                {showNotifications && <NotificationDropdown notifications={relevantNotifs} onMarkRead={id => setState(p => ({ ...p, notifications: p.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))} onMarkAllRead={() => setState(p => ({ ...p, notifications: p.notifications.map(n => ({ ...n, read: true })) }))} onClose={() => setShowNotifications(false)} />}
              </div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
             {activePage === 'inventory' ? renderInventory() : 
              activePage === 'lot_history' ? renderLotHistory() :
              activePage === 'dashboard' ? (
               <Dashboard role={state.currentUserRole} kpi={dashboardData.metrics} offers={dashboardData.rows} sellers={state.sellers} selectedSellerId={dashboardSellerFilter} onFilterSeller={setDashboardSellerFilter} onFinalizeSale={handleRequestFinalizeSale} onCancelLink={handleCancelLink} onNavigate={setActivePage} onSelectTransaction={handleSelectTransaction} onViewClientPage={navigateToClientView} />
             ) : (
               <AnalyticsDetailView title={getAnalyticsTitle(activePage)} mode={activePage === 'financials' ? 'profit' : activePage === 'pipeline' ? 'pipeline' : 'sales'} data={dashboardData.rows.filter(r => activePage === 'pipeline' ? r.offer.status === 'active' : r.offer.status === 'sold')} role={state.currentUserRole} onTransactionClick={handleSelectTransaction} />
             )}
          </div>
        </main>
      </div>
      {activeModal?.type === 'delegate' && <DelegateModal stone={activeModal.data} sellers={state.sellers} onClose={() => setActiveModal(null)} onConfirm={confirmDelegate} />}
      {activeModal?.type === 'offer' && <OfferModal delegation={activeModal.data} stone={state.stones.find(s => s.id === activeModal.data.stoneId)!} maxQuantity={activeModal.data.delegatedQuantity} onClose={() => setActiveModal(null)} onSuccess={handleOfferSuccess} />}
      {activeModal?.type === 'direct_link' && <DirectLinkModal stone={activeModal.data} onClose={() => setActiveModal(null)} onGenerate={confirmDirectLink} />}
      {activeModal?.type === 'industry_inventory' && <IndustryInventoryModal stone={activeModal.data} delegations={state.delegations.filter(d => d.stoneId === activeModal.data.id)} offers={state.offers.filter(o => o.stoneId === activeModal.data.id || state.delegations.find(d => d.id === o.delegationId)?.stoneId === activeModal.data.id)} sellers={state.sellers} onClose={() => setActiveModal(null)} onViewTransaction={handleDeepDive} onUpdateStone={handleUpdateStone} onDelegate={() => { const s = activeModal.data; setActiveModal(null); setTimeout(() => handleDelegate(s), 0); }} onDirectLink={() => { const s = activeModal.data; setActiveModal(null); setTimeout(() => handleDirectLink(s), 0); }} onViewClientPage={navigateToClientView} />}
      {activeModal?.type === 'transaction_details' && <TransactionDetailsModal transaction={activeModal.data} role={state.currentUserRole} onClose={() => setActiveModal(null)} onFinalizeSale={h => { setActiveModal(null); handleRequestFinalizeSale(h); }} onCancelLink={h => { setActiveModal(null); handleCancelLink(h); }} onViewClientPage={navigateToClientView} />}
      {activeModal?.type === 'confirm_sale' && <ConfirmSaleModal offer={activeModal.data} stone={state.stones.find(s => s.id === activeModal.data.stoneId || state.delegations.find(d => d.id === activeModal.data.delegationId)?.stoneId === s.id)!} onClose={() => setActiveModal(null)} onConfirm={confirmFinalizeSale} />}
      {(activeModal?.type === 'add_typology' || activeModal?.type === 'edit_typology') && <TypologyModal typology={activeModal.data} onClose={() => setActiveModal(null)} onSave={handleSaveTypology} />}
      {activeModal?.type === 'add_batch' && <BatchModal typologies={typologies} onClose={() => setActiveModal(null)} onSave={handleSaveBatch} />}
      {activeModal?.type === 'seller_inventory' && <SellerInventoryModal delegation={activeModal.data} stone={state.stones.find(s => s.id === activeModal.data.stoneId)!} offers={state.offers.filter(o => o.delegationId === activeModal.data.id)} onClose={() => setActiveModal(null)} onCreateOffer={() => { const d = activeModal.data; setActiveModal(null); setTimeout(() => handleCreateOffer(d), 0); }} onViewTransaction={handleDeepDive} onViewClientPage={navigateToClientView} />}
    </div>
  );
}

export default function App() { return <LanguageProvider><AppContent /></LanguageProvider>; }