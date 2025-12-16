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
import { KPIDetailsModal, KPIMode } from './components/KPIDetailsModal';
import { CancelLinkModal } from './components/CancelLinkModal';
import { ConfirmSaleModal } from './components/ConfirmSaleModal';
import { NotificationDropdown } from './components/NotificationDropdown';
import { ToastContainer } from './components/Toast.tsx';
import { Store, UserCircle, Copy, CheckCircle, Home, BarChart3, Package, ExternalLink, Plus, LayoutGrid, List, Bell } from 'lucide-react';

// --- MOCK DATA INJECTION ---

const MOCK_DELEGATIONS_DATA: SalesDelegation[] = [
  {
    id: 'del-mock-1',
    stoneId: 'inv-001', // Carrara
    sellerId: 'sel-001', // John
    delegatedQuantity: 5,
    agreedMinPrice: 2000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() // 10 days ago
  },
  {
    id: 'del-mock-2',
    stoneId: 'inv-002', // Nero
    sellerId: 'sel-002', // Sarah
    delegatedQuantity: 3,
    agreedMinPrice: 3500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

const MOCK_OFFERS_DATA: OfferLink[] = [
  // Sold by John (Delegated)
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
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  // Active by John (Delegated)
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
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  // Active by Sarah (Delegated)
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
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  // Sold Direct (Industry)
  {
    id: 'off-mock-4',
    stoneId: 'inv-004', // Travertine
    clientName: 'City Center Plaza',
    finalPrice: 1900,
    quantityOffered: 10,
    status: 'sold',
    clientViewToken: 'mock-token-4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
  },
   // Active Direct (Industry)
  {
    id: 'off-mock-5',
    stoneId: 'inv-003', // Calacatta
    clientName: 'Private Collector',
    finalPrice: 6500,
    quantityOffered: 1,
    status: 'active',
    clientViewToken: 'mock-token-5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
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

// Reconcile Stones with Mock Data
const getReconciledStones = (stones: StoneItem[], offers: OfferLink[], delegations: SalesDelegation[]): StoneItem[] => {
  return stones.map(stone => {
    let available = stone.quantity.total; // Start with total
    let reserved = 0;
    let sold = 0;

    // Apply Direct Sales/Reservations (Active Offers without delegation)
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

    // Apply Delegations
    const linkedDelegations = delegations.filter(d => d.stoneId === stone.id);
    linkedDelegations.forEach(d => {
      // Find sold items within this delegation
      const delOffers = offers.filter(o => o.delegationId === d.id);
      const soldQty = delOffers.filter(o => o.status === 'sold').reduce((acc, curr) => acc + curr.quantityOffered, 0);
      
      // Delegation logic:
      // Delegated Quantity moves from Available -> Reserved (initially)
      // When Sold, it moves from Reserved -> Sold.
      // So 'Current Reserved for this Delegation' = DelegatedQty - SoldQty
      
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

export default function App() {
  // Application State
  const [state, setState] = useState<AppState>({
    stones: MOCK_STONES, // Initial Load (Raw)
    sellers: MOCK_SELLERS,
    delegations: MOCK_DELEGATIONS_DATA,
    offers: MOCK_OFFERS_DATA,
    notifications: MOCK_NOTIFICATIONS_DATA,
    currentUserRole: 'industry_admin',
    currentSellerId: 'sel-001',
    currentView: 'dashboard'
  });

  // Re-calculate inventory whenever offers/delegations change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      stones: getReconciledStones(MOCK_STONES, prev.offers, prev.delegations)
    }));
  }, [state.offers, state.delegations]);


  // Extract unique typologies from initial stones for independent state management
  const initialTypologies = useMemo(() => {
    const uniqueMap = new Map();
    state.stones.forEach(s => uniqueMap.set(s.typology.id, s.typology));
    return Array.from(uniqueMap.values());
  }, []);

  const [typologies, setTypologies] = useState<StoneTypology[]>(initialTypologies);

  // UI State
  const [activeModal, setActiveModal] = useState<{ 
    type: 'delegate' | 'offer' | 'direct_link' | 'link_history' | 'add_typology' | 'edit_typology' | 'add_batch' | 'kpi_details' | 'cancel_link' | 'confirm_sale', 
    data: any 
  } | null>(null);
  const [generatedLink, setGeneratedLink] = useState<{ url: string, token: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<'inventory' | 'analytics'>('analytics');
  
  // Industry specific sub-view state
  const [industrySubView, setIndustrySubView] = useState<'real_inventory' | 'catalog'>('real_inventory');
  
  // Filter States
  const [dashboardSellerFilter, setDashboardSellerFilter] = useState<string>('all');
  
  // Inventory Filters
  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('all');
  const [invTypologyFilter, setInvTypologyFilter] = useState('all');

  // --- Actions ---

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
    
    // Inventory update is handled by useEffect reconciliation
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
      expiresAt: new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString()
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
    // Ensure the new offer has the status field
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
      // Cascade update to stones using this typology
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
    // Add new item to MOCK_STONES reference as well for consistency across renders
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

  // RF-009: Consolidate Stock Logic (Request)
  const handleRequestFinalizeSale = (offer: OfferLink) => {
    setActiveModal({ type: 'confirm_sale', data: offer });
  };

  // RF-009: Execute
  const confirmFinalizeSale = () => {
    const offerToSell = activeModal?.data as OfferLink;
    if (!offerToSell) return;

    // Update Offer Status
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

    // Setting status to 'expired' effectively releases the stock in getReconciledStones logic
    // because that function only subtracts stock for 'active' or 'sold' statuses.
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

  // RF-008 Logic: "The Snitch"
  const navigateToClientView = (token: string) => {
    setState(prev => {
      const offer = prev.offers.find(o => o.clientViewToken === token);
      let notifications = prev.notifications;

      if (offer && offer.status === 'active') {
        // Find owner to notify
        let recipientId = 'industry'; // Default for direct links
        let sellerName = 'Industry';
        let stoneName = 'Stone';

        if (offer.delegationId) {
           const del = prev.delegations.find(d => d.id === offer.delegationId);
           if (del) recipientId = del.sellerId;
        }

        // Get stone name for message
        const stone = prev.stones.find(s => s.id === offer.stoneId) || 
                      prev.stones.find(s => {
                        const del = prev.delegations.find(d => d.id === offer.delegationId);
                        return del?.stoneId === s.id;
                      });
        if (stone) stoneName = stone.typology.name;

        // Add Notification
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
    // Pick the first active offer to demo
    const activeOffer = state.offers.find(o => o.status === 'active');
    if (activeOffer) {
      navigateToClientView(activeOffer.clientViewToken);
    } else {
       // Fallback: pick any offer to show screen
       const anyOffer = state.offers[0];
       if (anyOffer) navigateToClientView(anyOffer.clientViewToken);
    }
  };

  // --- KPI Details Modal Logic ---
  const handleViewKPI = (mode: KPIMode) => {
     // Prepare data subset based on mode
     let filteredData = dashboardData.rows;

     if (mode === 'pipeline') {
       filteredData = dashboardData.rows.filter(r => r.offer.status === 'active');
     } else if (mode === 'sales' || mode === 'profit') {
       filteredData = dashboardData.rows.filter(r => r.offer.status === 'sold');
     }

     setActiveModal({ type: 'kpi_details', data: { mode, items: filteredData } });
  };


  // --- Derived Data (Analytics Logic) ---

  const dashboardData = useMemo(() => {
    let filteredOffers = state.offers;
    
    // 1. Filter by Role & Selection
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

    // 3. Calculate KPIs (RF-010 & RF-011)
    let pipelineRevenue = 0; // "Em processo"
    let soldRevenue = 0;     // "Total Vendido"
    let totalProfit = 0;

    enrichedOffers.forEach(({ offer, stone, delegation }) => {
      const revenue = offer.finalPrice * offer.quantityOffered;
      
      // Revenue Buckets
      if (offer.status === 'sold') {
        soldRevenue += revenue;
        
        // Profit is only counted for Realized Sales in this stricter model?
        // Let's count profit for realized sales only to match "Lucro Líquido" usually meaning realized.
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
        labelProfit: state.currentUserRole === 'industry_admin' ? 'Net Profit (Realized)' : 'Commission (Realized)'
      },
      rows: enrichedOffers
    };

  }, [state.offers, state.delegations, state.stones, state.sellers, state.currentUserRole, state.currentSellerId, dashboardSellerFilter]);


  // --- Render Views ---

  // 0. Public Client View
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
        <ClientView offer={offer} stone={stone} seller={seller} />
        
        {/* Demo Navigation Switcher - Added per request */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-slate-200 z-50 flex items-center space-x-1 animate-in slide-in-from-bottom-10 fade-in duration-500">
             <div className="pl-3 pr-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200/50 mr-1">
               Demo Controls
             </div>
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'industry_admin', currentView: 'dashboard' })); setViewMode('inventory'); }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Industry Admin
              </button>
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'seller', currentView: 'dashboard' })); setViewMode('inventory'); }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Seller View
              </button>
              <button 
                className="px-4 py-2 rounded-full text-xs font-medium transition-all bg-slate-900 text-white shadow-md cursor-default"
              >
                Client View
              </button>
        </div>
      </>
    );
  }

  // 1. Dashboard View
  const renderDashboard = () => (
    <Dashboard 
      role={state.currentUserRole}
      kpi={dashboardData.metrics}
      offers={dashboardData.rows}
      sellers={state.sellers}
      selectedSellerId={dashboardSellerFilter}
      onFilterSeller={setDashboardSellerFilter}
      onFinalizeSale={handleRequestFinalizeSale}
      onCancelLink={handleCancelLink}
      onViewKPI={handleViewKPI}
    />
  );

  // 2. Inventory Grid View
  const renderInventory = () => {
    if (state.currentUserRole === 'industry_admin') {
      
      // Use the separate typologies state for filters and Catalog view
      const uniqueTypologies = typologies;

      // --- FILTER LOGIC (RF-003 Support) ---
      const filteredStones = state.stones.filter(stone => {
        // Search
        const matchesSearch = invSearch 
           ? stone.lotId.toLowerCase().includes(invSearch.toLowerCase()) || stone.typology.name.toLowerCase().includes(invSearch.toLowerCase())
           : true;
        
        // Status Filter
        let matchesStatus = true;
        if (invStatusFilter === 'available') matchesStatus = stone.quantity.available > 0;
        if (invStatusFilter === 'sold') matchesStatus = stone.quantity.available === 0 && stone.quantity.sold > 0;
        if (invStatusFilter === 'reserved') matchesStatus = stone.quantity.reserved > 0;

        // Typology Filter
        const matchesTypology = invTypologyFilter !== 'all' ? stone.typology.id === invTypologyFilter : true;

        return matchesSearch && matchesStatus && matchesTypology;
      });

      return (
        <div className="space-y-6">
          {/* Sub-Navigation for Industry (RF-001 vs RF-002) */}
          <div className="flex justify-center mb-6">
             <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
                <button 
                  onClick={() => setIndustrySubView('real_inventory')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${industrySubView === 'real_inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Stock & Inventory
                </button>
                <button 
                  onClick={() => setIndustrySubView('catalog')}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${industrySubView === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Typology Catalog
                </button>
             </div>
          </div>

          {industrySubView === 'real_inventory' ? (
            <>
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900">Physical Stock</h2>
                 <button 
                   onClick={handleAddStock}
                   className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                 >
                   <Plus className="w-4 h-4 mr-2" />
                   Add New Batch
                 </button>
               </div>

               <InventoryFilters 
                 searchTerm={invSearch}
                 onSearchChange={setInvSearch}
                 statusFilter={invStatusFilter}
                 onStatusFilterChange={setInvStatusFilter}
                 typologyFilter={invTypologyFilter}
                 onTypologyFilterChange={setInvTypologyFilter}
                 typologies={uniqueTypologies}
               />

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                 {filteredStones.map(stone => (
                   <StoneCard 
                     key={stone.id} 
                     stone={stone} 
                     role="industry_admin"
                     onDelegate={handleDelegate}
                     onDirectLink={handleDirectLink}
                   />
                 ))}
                 {filteredStones.length === 0 && (
                   <div className="col-span-full py-12 text-center text-slate-400">
                     No stones found matching your filters.
                   </div>
                 )}
               </div>
            </>
          ) : (
            <CatalogView 
              typologies={uniqueTypologies} 
              onAddTypology={handleAddTypology}
              onEditTypology={handleEditTypology}
            />
          )}
        </div>
      );
    } else {
      // SELLER VIEW (Unchanged)
      const myDelegations = state.delegations.filter(d => d.sellerId === state.currentSellerId);
      return (
        <div className="animate-in fade-in duration-500">
          {myDelegations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">No stones assigned to you yet.</p>
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
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    }
  };

  // Filter notifications for current user
  const relevantNotifications = state.notifications.filter(n => {
    if (state.currentUserRole === 'industry_admin') return true; // Admin sees all for demo/oversight
    return n.recipientId === state.currentSellerId;
  });

  // Toasts only show for unread items marked as 'isToast'
  const activeToasts = relevantNotifications.filter(n => n.isToast);

  const unreadCount = relevantNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      
      <ToastContainer notifications={activeToasts} onDismiss={dismissToast} />

      {/* App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={navigateHome}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CAVA</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-slate-100 rounded-full p-1">
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'industry_admin', currentView: 'dashboard' })); setViewMode('inventory'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${state.currentUserRole === 'industry_admin' && state.currentView === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Industry Admin
              </button>
              <button 
                onClick={() => { setState(s => ({ ...s, currentUserRole: 'seller', currentView: 'dashboard' })); setViewMode('inventory'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${state.currentUserRole === 'seller' && state.currentView === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Seller View
              </button>
              <button 
                onClick={simulateClientView}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${typeof state.currentView === 'object' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Client View
              </button>
            </div>

            <div className="flex items-center space-x-4 border-l border-slate-200 pl-6">
              
              {/* Notification Center */}
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

              <div className="flex items-center space-x-2">
                <UserCircle className="w-8 h-8 text-slate-300" />
                <div className="text-sm hidden sm:block">
                  <p className="font-medium text-slate-900">
                    {state.currentUserRole === 'industry_admin' ? 'HQ Admin' : 'John Stone'}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{state.currentUserRole.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex space-x-8">
             <button 
               onClick={() => setViewMode('inventory')}
               className={`flex items-center py-4 border-b-2 text-sm font-medium transition-colors ${viewMode === 'inventory' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
               <Package className="w-4 h-4 mr-2" />
               Inventory & Catalog
             </button>
             <button 
               onClick={() => setViewMode('analytics')}
               className={`flex items-center py-4 border-b-2 text-sm font-medium transition-colors ${viewMode === 'analytics' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
               <BarChart3 className="w-4 h-4 mr-2" />
               Analytics & Offers
             </button>
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'inventory' ? renderInventory() : renderDashboard()}
      </main>

      {/* Modals & Toasts */}
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
      
      {activeModal?.type === 'kpi_details' && (
        <KPIDetailsModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={
            activeModal.data.mode === 'pipeline' ? 'Active Pipeline Details' :
            activeModal.data.mode === 'sales' ? 'Sold Revenue Details' :
            activeModal.data.mode === 'profit' ? 'Net Profit Breakdown' : 'Details'
          }
          mode={activeModal.data.mode}
          data={activeModal.data.items}
          role={state.currentUserRole}
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
              <span>Link Ready!</span>
            </div>
            <div className="bg-slate-800 p-2 rounded text-xs font-mono break-all text-slate-300">
              {generatedLink.url}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink.url);
                  alert('Copied to clipboard!');
                }}
                className="flex items-center justify-center py-2 bg-white text-slate-900 rounded text-sm font-bold hover:bg-slate-100"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
              <button 
                onClick={() => {
                   navigateToClientView(generatedLink.token);
                   setGeneratedLink(null);
                }}
                className="flex items-center justify-center py-2 bg-slate-700 text-white rounded text-sm font-bold hover:bg-slate-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </button>
            </div>
            <button 
              onClick={() => setGeneratedLink(null)} 
              className="text-xs text-slate-500 hover:text-slate-300 underline text-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}