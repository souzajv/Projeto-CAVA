
import React, { useState, useMemo, useCallback } from 'react';
import { 
  AppState, StoneItem, Seller, SalesDelegation, OfferLink, Notification, 
  UserRole, StoneTypology, Client 
} from './types';
import { MOCK_STONES, MOCK_SELLERS, MOCK_DELEGATIONS, MOCK_OFFERS, MOCK_TYPOLOGIES, MOCK_CLIENTS } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { InventoryService } from './domain/services/InventoryService';

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
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { AnalyticsDetailView } from './components/AnalyticsDetailView';
import { SellerInventoryModal } from './components/SellerInventoryModal';
import { IndustryInventoryModal } from './components/IndustryInventoryModal';
import { InterestThermometerView } from './components/InterestThermometerView';
import { NotificationDropdown } from './components/NotificationDropdown';
import { CRMView } from './components/CRMView';
import { ClientFormModal } from './components/ClientFormModal';
import { ClientDetailsModal } from './components/ClientDetailsModal';
import { LotHistoryView } from './components/LotHistoryView';

import { 
  Bell, Plus, LayoutGrid, List
} from 'lucide-react';

const AppContent = () => {
  const { t, formatCurrency } = useLanguage();

  const [sellers] = useState<Seller[]>(MOCK_SELLERS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [delegations, setDelegations] = useState<SalesDelegation[]>(MOCK_DELEGATIONS);
  const [offers, setOffers] = useState<OfferLink[]>(MOCK_OFFERS);
  const [rawStones, setRawStones] = useState<StoneItem[]>(MOCK_STONES);
  const [typologies, setTypologies] = useState<StoneTypology[]>(MOCK_TYPOLOGIES);

  // Inventário Calculado pelo Serviço de Domínio (Clean Architecture)
  const stones = useMemo(() => {
    return InventoryService.reconcile(rawStones, delegations, offers);
  }, [rawStones, delegations, offers]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('industry_admin');
  const [currentSellerId, setCurrentSellerId] = useState<string>('all');
  const [currentView, setCurrentView] = useState<AppState['currentView']>('dashboard');
  const [activePage, setActivePage] = useState<PageView>('dashboard');
  
  const [inventoryMode, setInventoryMode] = useState<'lots' | 'catalog'>('lots');
  const [invSearch, setInvSearch] = useState('');
  const [invTypologyFilter, setInvTypologyFilter] = useState('all');
  const [invStatusFilter, setInvStatusFilter] = useState('all');

  const [activeModal, setActiveModal] = useState<{
    type: 'delegate' | 'offer' | 'direct' | 'transaction' | 'seller_inv' | 'industry_inv' | 'typology' | 'batch' | 'client_form' | 'client_details' | null;
    data?: any;
  }>({ type: null });

  const [showNotifications, setShowNotifications] = useState(false);

  // --- 1. FILTRAGEM CENTRAL ---
  const visibleOffers = useMemo(() => {
    const list = offers || [];
    if (currentUserRole === 'industry_admin') {
      if (currentSellerId === 'all') return list;
      return list.filter(o => {
        if (!o.delegationId) return false; 
        const del = delegations.find(d => d.id === o.delegationId);
        return del && del.sellerId === currentSellerId;
      });
    } else {
      return list.filter(o => {
        if (!o.delegationId) return false;
        const del = delegations.find(d => d.id === o.delegationId);
        return del && del.sellerId === currentSellerId;
      });
    }
  }, [offers, currentUserRole, currentSellerId, delegations]);

  // --- 2. ENRIQUECIMENTO ---
  const enrichedOffers = useMemo(() => {
    return visibleOffers.map(o => ({
      offer: o,
      stone: stones.find(s => s.id === o.stoneId)!,
      seller: o.delegationId ? sellers.find(s => s.id === delegations.find(d => d.id === o.delegationId)?.sellerId) : undefined,
      delegation: delegations.find(d => d.id === o.delegationId)
    })).filter(item => item.stone);
  }, [visibleOffers, stones, sellers, delegations]);

  // --- 3. SEGREGAÇÃO ---
  // Pipeline: Active OR Reservation Pending OR Reserved (Before finalized as Sold)
  const pipelineData = useMemo(() => 
    enrichedOffers.filter(item => ['active', 'reservation_pending', 'reserved'].includes(item.offer.status)), 
  [enrichedOffers]);

  const salesData = useMemo(() => 
    enrichedOffers.filter(item => item.offer.status === 'sold'), 
  [enrichedOffers]);

  const currentUser = currentUserRole === 'industry_admin' 
    ? { name: 'HQ Admin', roleLabel: 'Global Admin' }
    : { name: sellers.find(s => s.id === currentSellerId)?.name || 'Seller', roleLabel: 'Partner' };

  // 4. KPI Calculation
  const kpi = useMemo(() => {
     const pipelineRevenue = pipelineData.reduce((sum, item) => sum + (item.offer.finalPrice * item.offer.quantityOffered), 0);
     const soldRevenue = salesData.reduce((sum, item) => sum + (item.offer.finalPrice * item.offer.quantityOffered), 0);
     
     let totalProfit = 0;
     if (currentUserRole === 'industry_admin') {
       totalProfit = salesData.reduce((sum, item) => {
          const cost = item.stone.baseCost * item.offer.quantityOffered;
          return sum + ((item.offer.finalPrice * item.offer.quantityOffered) - cost);
       }, 0);
     } else {
       totalProfit = salesData.reduce((sum, item) => {
          const cost = (item.delegation?.agreedMinPrice || 0) * item.offer.quantityOffered;
          return sum + ((item.offer.finalPrice * item.offer.quantityOffered) - cost);
       }, 0);
     }

     return {
         pipelineRevenue,
         soldRevenue,
         totalProfit,
         labelProfit: currentUserRole === 'industry_admin' ? t('dash.kpi.profit_admin') : t('dash.kpi.profit_seller')
     };
  }, [pipelineData, salesData, currentUserRole, t]);

  const addNotification = useCallback((msg: string, type: 'info' | 'success' | 'alert' = 'info') => {
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
  }, [currentUserRole, currentSellerId]);

  // --- ACTIONS ---

  const handleDelegate = (stoneId: string, sellerId: string, quantity: number, minPrice: number) => {
    const stone = stones.find(s => s.id === stoneId);
    if (!stone) return;
    if (stone.quantity.available < quantity) {
        addNotification(t('toast.error_avail', { qty: stone.quantity.available }), 'alert');
        return;
    }
    const newDelegation: SalesDelegation = {
      id: `del-${Date.now()}`,
      stoneId,
      sellerId,
      delegatedQuantity: quantity,
      agreedMinPrice: minPrice,
      createdAt: new Date().toISOString()
    };
    setDelegations(prev => [...prev, newDelegation]);
    addNotification(t('toast.delegated', { qty: quantity, unit: t(`unit.${stone.quantity.unit}`), stone: stone.typology.name }), 'success');
    setActiveModal({ type: null });
  };

  const handleCreateOffer = (offer: OfferLink) => {
    setOffers(prev => [offer, ...prev]);
    addNotification(t('toast.link_ready'), 'success');
    setActiveModal({ type: null });
  };

  const handleFinalizeSale = (offer: OfferLink) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'sold' as const } : o));
    addNotification(t('toast.sale_confirmed', { client: offer.clientName, value: formatCurrency(offer.finalPrice * offer.quantityOffered) }), 'success');
    setActiveModal({ type: null });
  };

  const handleCancelLink = (offer: OfferLink) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'expired' as const } : o));
    addNotification(t('toast.link_cancelled', { client: offer.clientName }), 'alert');
    setActiveModal({ type: null });
  };

  // --- RESERVATION WORKFLOW HANDLERS ---

  const handleRequestReservation = (offer: OfferLink) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'reservation_pending' } : o));
    addNotification(`Reservation requested for ${offer.clientName}. Pending Industry approval.`, 'info');
  };

  const handleApproveReservation = (offer: OfferLink) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'reserved' } : o));
    addNotification(`Reservation approved for ${offer.clientName}. Stock is now Hard Locked.`, 'success');
  };

  const handleRejectReservation = (offer: OfferLink) => {
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'active' } : o));
    addNotification(`Reservation rejected for ${offer.clientName}. Link returned to Active.`, 'alert');
  };

  // -------------------------------------

  const handleRevokeDelegation = (delegationId: string) => {
      const activeLinkedOffers = offers.filter(o => o.delegationId === delegationId && ['active', 'reserved', 'reservation_pending'].includes(o.status));
      if (activeLinkedOffers.length > 0) {
          addNotification(t('msg.revoke_block_active'), 'alert');
          return;
      }
      setDelegations(prev => prev.filter(d => d.id !== delegationId));
      addNotification(t('toast.delegation_revoked'), 'info');
      setActiveModal({ type: null });
  };

  const handleSaveClient = (client: Client) => {
    setClients(prev => {
        const exists = prev.find(c => c.id === client.id);
        if (exists) return prev.map(c => c.id === client.id ? client : c);
        return [client, ...prev];
    });
    if (activeModal.type === 'client_form') {
        setActiveModal({ type: null });
    }
    addNotification('Registro CRM atualizado.', 'success');
  };

  // --- RENDER HELPERS ---

  const renderInventory = () => {
    const filteredStones = stones.filter(s => {
       const matchesSearch = !invSearch || s.typology.name.toLowerCase().includes(invSearch.toLowerCase()) || s.lotId.toLowerCase().includes(invSearch.toLowerCase());
       const matchesType = invTypologyFilter === 'all' || s.typology.id === invTypologyFilter;
       
       const isFullySold = s.quantity.available === 0 && s.quantity.reserved === 0 && s.quantity.sold >= s.quantity.total;
       if (isFullySold) return false; 

       const matchesStatus = invStatusFilter === 'all' || 
          (invStatusFilter === 'available' && s.quantity.available > 0) || 
          (invStatusFilter === 'reserved' && s.quantity.reserved > 0);
       
       return matchesSearch && matchesType && matchesStatus;
    });

    return (
      <div className="space-y-8 pt-8 lg:pt-12">
         <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-200 pb-8">
            <div>
               <h2 className="text-4xl font-serif mb-2">{t('nav.inventory')}</h2>
               <p className="text-slate-500 font-light text-lg">{t('inv.your_inventory')}</p>
            </div>
            
            <div className="flex items-center gap-4">
                {currentUserRole === 'industry_admin' && (
                   <div className="bg-slate-100 p-1 rounded-sm flex">
                      <button 
                        onClick={() => setInventoryMode('lots')}
                        className={`px-4 py-2 flex items-center text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${inventoryMode === 'lots' ? 'bg-white shadow-sm text-[#121212]' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                         <LayoutGrid className="w-4 h-4 mr-2" /> Lots
                      </button>
                      <button 
                        onClick={() => setInventoryMode('catalog')}
                        className={`px-4 py-2 flex items-center text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${inventoryMode === 'catalog' ? 'bg-white shadow-sm text-[#121212]' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                         <List className="w-4 h-4 mr-2" /> Catalog
                      </button>
                   </div>
                )}

                {currentUserRole === 'industry_admin' && inventoryMode === 'lots' && (
                   <button onClick={() => setActiveModal({ type: 'batch' })} className="px-6 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest flex items-center rounded-sm hover:bg-[#C2410C] transition-colors shadow-lg">
                      <Plus className="w-4 h-4 mr-2" /> {t('inv.add_batch')}
                   </button>
                )}
                {currentUserRole === 'industry_admin' && inventoryMode === 'catalog' && (
                   <button onClick={() => setActiveModal({ type: 'typology', data: null })} className="px-6 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest flex items-center rounded-sm hover:bg-[#C2410C] transition-colors shadow-lg">
                      <Plus className="w-4 h-4 mr-2" /> New Typology
                   </button>
                )}
            </div>
         </div>

         {inventoryMode === 'lots' ? (
            <>
               <InventoryFilters searchTerm={invSearch} onSearchChange={setInvSearch} statusFilter={invStatusFilter} onStatusFilterChange={setInvStatusFilter} typologyFilter={invTypologyFilter} onTypologyFilterChange={setInvTypologyFilter} typologies={typologies} />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredStones.map((s, i) => (
                     <StoneCard key={s.id} stone={s} role={currentUserRole} index={i} onClick={() => setActiveModal({ type: currentUserRole === 'industry_admin' ? 'industry_inv' : 'seller_inv', data: currentUserRole === 'industry_admin' ? s : { stone: s, delegation: delegations.find(d => d.stoneId === s.id && d.sellerId === currentSellerId) } })} onDelegate={(stone) => setActiveModal({ type: 'delegate', data: stone })} onDirectLink={(stone) => setActiveModal({ type: 'direct', data: stone })} />
                  ))}
               </div>
            </>
         ) : (
            <CatalogView typologies={typologies} onEditTypology={(typology) => setActiveModal({ type: 'typology', data: typology })} />
         )}
      </div>
    );
  };

  if (typeof currentView === 'object' && currentView.type === 'client_view') {
     const token = currentView.token;
     const offer = (offers || []).find(o => o && o.clientViewToken === token);
     if (!offer) return <div className="p-20 text-center font-serif text-2xl">404 - Offer Link Not Found</div>;
     const stone = stones.find(s => s.id === offer.stoneId);
     const seller = offer.delegationId ? sellers.find(s => s.id === delegations.find(d => d.id === offer.delegationId)?.sellerId) : undefined;
     if (!stone) return <div className="p-20 text-center">Stone data inconsistent</div>;
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
              setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, viewLog: [...(o.viewLog || []), { timestamp: new Date().toISOString(), durationMs: duration }] } : o));
           }}
        />
     );
  }

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
          <div className="absolute top-6 right-8 z-50 flex items-center space-x-6">
             <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-400 hover:text-[#121212] transition-colors bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm border border-slate-100">
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />}
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
                <button onClick={() => { setCurrentUserRole('industry_admin'); setCurrentSellerId('all'); setActivePage('dashboard'); }} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${currentUserRole === 'industry_admin' ? 'bg-white shadow-sm text-[#121212]' : 'text-slate-400'}`}>Admin</button>
                <button onClick={() => { setCurrentUserRole('seller'); setCurrentSellerId('sel-001'); setActivePage('dashboard'); }} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${currentUserRole === 'seller' ? 'bg-white shadow-sm text-[#121212]' : 'text-slate-400'}`}>Seller</button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 lg:px-12 lg:pb-12 pt-0 scroll-smooth">
             <div className="max-w-[1600px] mx-auto h-full">
                {activePage === 'dashboard' && (
                   <div className="pt-8 lg:pt-12">
                       <Dashboard 
                          role={currentUserRole} 
                          kpi={kpi} 
                          offers={enrichedOffers} 
                          sellers={sellers} 
                          selectedSellerId={currentSellerId} 
                          onFilterSeller={setCurrentSellerId} 
                          onFinalizeSale={handleFinalizeSale} 
                          onCancelLink={handleCancelLink} 
                          onNavigate={setActivePage} 
                          onSelectTransaction={(tx) => setActiveModal({ type: 'transaction', data: tx })} 
                          onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
                          onApproveReservation={handleApproveReservation}
                          onRejectReservation={handleRejectReservation}
                       />
                   </div>
                )}
                {activePage === 'inventory' && renderInventory()}
                {activePage === 'lot_history' && (
                   <div className="pt-8 lg:pt-12">
                      <LotHistoryView 
                        stones={stones} 
                        offers={offers} 
                        delegations={delegations} 
                        sellers={sellers}
                        onSelectLot={(stone) => setActiveModal({ type: currentUserRole === 'industry_admin' ? 'industry_inv' : 'seller_inv', data: currentUserRole === 'industry_admin' ? stone : { stone, delegation: delegations.find(d => d.stoneId === stone.id && d.sellerId === currentSellerId) } })}
                      />
                   </div>
                )}
                {activePage === 'clients' && (
                   <div className="pt-8 lg:pt-12">
                      <CRMView 
                         clients={clients} 
                         offers={offers} 
                         role={currentUserRole} 
                         currentSellerId={currentSellerId}
                         onAddClient={() => setActiveModal({ type: 'client_form', data: null })}
                         onSelectClient={(c) => setActiveModal({ type: 'client_details', data: c })}
                      />
                   </div>
                )}
                {activePage === 'thermometer' && (
                  <div className="pt-8 lg:pt-12">
                      <InterestThermometerView 
                         offers={offers.filter(o => o.status === 'active' || o.status === 'reservation_pending')} 
                         stones={stones} 
                         sellers={sellers} 
                         delegations={delegations} 
                         role={currentUserRole} 
                         onSelectTransaction={(item) => {
                            const relatedStone = stones.find(s => s.id === item?.offer?.stoneId);
                            const relatedSeller = item?.offer?.delegationId ? sellers.find(s => s.id === delegations.find(d => d.id === item.offer.delegationId)?.sellerId) : undefined;
                            
                            setActiveModal({ 
                                type: 'transaction', 
                                data: { 
                                    offer: item.offer, 
                                    stone: relatedStone,
                                    seller: relatedSeller,
                                    delegation: delegations.find(d => d.id === item.offer.delegationId)
                                } 
                            });
                         }} 
                         onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
                      />
                  </div>
                )}
                
                {activePage === 'pipeline' && (
                   <div className="pt-8 lg:pt-12">
                      <AnalyticsDetailView 
                         title={t('nav.pipeline')} 
                         mode="pipeline"
                         role={currentUserRole} 
                         data={pipelineData} 
                         onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                      />
                   </div>
                )}
                
                {activePage === 'sales' && (
                   <div className="pt-8 lg:pt-12">
                      <AnalyticsDetailView 
                         title={t('nav.sales')} 
                         mode="sales"
                         role={currentUserRole} 
                         data={salesData} 
                         onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                      />
                   </div>
                )}
                
                {activePage === 'financials' && (
                   <div className="pt-8 lg:pt-12">
                      <AnalyticsDetailView 
                         title={t(currentUserRole === 'industry_admin' ? 'nav.financials_admin' : 'nav.financials_seller')} 
                         mode="profit"
                         role={currentUserRole} 
                         data={salesData} 
                         onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                      />
                   </div>
                )}
             </div>
          </div>

          <ToastContainer notifications={notifications.filter(n => !n.read && n.isToast)} onDismiss={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))} />

          {activeModal.type === 'client_form' && <ClientFormModal currentUserId={currentUserRole === 'industry_admin' ? 'admin' : currentSellerId} currentUserRole={currentUserRole} onClose={() => setActiveModal({ type: null })} onSave={handleSaveClient} />}
          {
            activeModal.type === 'client_details' && 
            <ClientDetailsModal 
                client={activeModal.data} 
                offers={offers} 
                stones={stones} 
                sellers={sellers} 
                delegations={delegations} 
                role={currentUserRole} 
                onClose={() => setActiveModal({ type: null })} 
                onSave={handleSaveClient} 
                onViewClientPage={(t) => setCurrentView({ type: 'client_view', token: t })} 
                onRequestReservation={handleRequestReservation}
                onApproveReservation={handleApproveReservation}
                onFinalizeSale={handleFinalizeSale}
            />
          }
          {activeModal.type === 'delegate' && <DelegateModal stone={activeModal.data} sellers={sellers} onClose={() => setActiveModal({ type: null })} onConfirm={(selId, qty, p) => handleDelegate(activeModal.data.id, selId, qty, p)} />}
          {activeModal.type === 'direct' && <DirectLinkModal stone={activeModal.data} clients={clients} onClose={() => setActiveModal({ type: null })} onGenerate={(p, q, cId, cN) => {
             const token = Math.random().toString(36).substring(7);
             const newOffer: OfferLink = { id: `off-${Date.now()}`, stoneId: activeModal.data.id, clientId: cId, clientName: cN, finalPrice: p, quantityOffered: q, status: 'active', clientViewToken: token, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), viewLog: [] };
             handleCreateOffer(newOffer);
          }} />}
          {activeModal.type === 'offer' && (
             <OfferModal 
                delegation={activeModal.data.delegation} stone={activeModal.data.stone} clients={clients} maxQuantity={stones.find(s => s.id === activeModal.data.stone.id)?.quantity.available || 0} onClose={() => setActiveModal({ type: null })} onSuccess={handleCreateOffer}
             />
          )}
          {activeModal.type === 'seller_inv' && (
            <SellerInventoryModal 
              delegation={activeModal.data.delegation} 
              stone={activeModal.data.stone} 
              offers={offers.filter(o => o.delegationId === activeModal.data.delegation.id)} 
              onClose={() => setActiveModal({ type: null })} 
              onCreateOffer={(d) => setActiveModal({ type: 'offer', data: { delegation: d, stone: activeModal.data.stone } })} 
              onViewTransaction={(o) => setActiveModal({ type: 'transaction', data: { offer: o, stone: activeModal.data.stone, delegation: activeModal.data.delegation } })} 
              onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
              onRequestReservation={handleRequestReservation} 
              onFinalizeSale={handleFinalizeSale}
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
                onUpdateStone={(updated) => setRawStones(prev => prev.map(s => s.id === updated.id ? updated : s))} 
                onDelegate={() => setActiveModal({ type: 'delegate', data: activeModal.data })} 
                onDirectLink={() => setActiveModal({ type: 'direct', data: activeModal.data })} 
                onRevokeDelegation={handleRevokeDelegation} 
                onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })} 
                onReserve={handleApproveReservation}
                onFinalizeSale={handleFinalizeSale}
            />
          )}
          {activeModal.type === 'transaction' && <TransactionDetailsModal transaction={activeModal.data} role={currentUserRole} onClose={() => setActiveModal({ type: null })} onFinalizeSale={handleFinalizeSale} onCancelLink={handleCancelLink} onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })} onRequestReservation={handleRequestReservation} onApproveReservation={handleApproveReservation} />}
          {activeModal.type === 'typology' && <TypologyModal typology={activeModal.data} onClose={() => setActiveModal({ type: null })} onSave={(newType) => setTypologies(prev => activeModal.data ? prev.map(t => t.id === newType.id ? newType : t) : [...prev, newType])} />}
          {activeModal.type === 'batch' && <BatchModal typologies={typologies} onClose={() => setActiveModal({ type: null })} onSave={(newItem) => { setRawStones(prev => [newItem, ...prev]); addNotification(t('toast.batch_added', { id: newItem.lotId }), 'success'); }} />}
       </main>
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
