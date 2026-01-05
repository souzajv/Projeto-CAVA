
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
   AppState, StoneItem, Seller, SalesDelegation, OfferLink, Notification,
   UserRole, StoneTypology, Client
} from './types';
import { DEMO_TENANT_ID, MOCK_STONES, MOCK_SELLERS, MOCK_DELEGATIONS, MOCK_OFFERS, MOCK_TYPOLOGIES, MOCK_CLIENTS } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { InventoryService } from './domain/services/InventoryService';

// Components
import { Sidebar, PageView } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { StoneCard } from './components/inventory/StoneCard';
import { ClientView } from './components/clients/ClientView';
import { ToastContainer } from './components/ui/Toast';
import { InventoryFilters } from './components/inventory/InventoryFilters';
import { CatalogView } from './components/catalog/CatalogView';
import { BatchModal } from './components/inventory/BatchModal';
import { TypologyModal } from './components/catalog/TypologyModal';
import { DelegateModal } from './components/offers/DelegateModal';
import { OfferModal } from './components/offers/OfferModal';
import { DirectLinkModal } from './components/offers/DirectLinkModal';
import { TransactionDetailsModal } from './components/offers/TransactionDetailsModal';
import { AnalyticsDetailView } from './components/analytics/AnalyticsDetailView';
import { SellerInventoryModal } from './components/inventory/SellerInventoryModal';
import { IndustryInventoryModal } from './components/inventory/IndustryInventoryModal';
import { InterestThermometerView } from './components/analytics/InterestThermometerView';
import { NotificationDropdown } from './components/layout/NotificationDropdown';
import { CRMView } from './components/clients/CRMView';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { ClientDetailsModal } from './components/clients/ClientDetailsModal';
import { LotHistoryView } from './components/analytics/LotHistoryView';
import { ReservationModal } from './components/offers/ReservationModal';

import {
   Bell, Plus, LayoutGrid, List, Menu
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const AppContent = () => {
   const { t, formatCurrency } = useLanguage();

   const [currentTenantId] = useState<string>(DEMO_TENANT_ID);
   const [sellers] = useState<Seller[]>(MOCK_SELLERS);
   const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
   const [delegations, setDelegations] = useState<SalesDelegation[]>(MOCK_DELEGATIONS);
   const [offers, setOffers] = useState<OfferLink[]>(MOCK_OFFERS);
   const [rawStones, setRawStones] = useState<StoneItem[]>(MOCK_STONES);
   const [typologies, setTypologies] = useState<StoneTypology[]>(MOCK_TYPOLOGIES);

   // Filtragem por tenant (indústria)
   const tenantStones = useMemo(() => rawStones.filter(s => s.tenantId === currentTenantId), [rawStones, currentTenantId]);
   const tenantDelegations = useMemo(() => delegations.filter(d => d.tenantId === currentTenantId), [delegations, currentTenantId]);
   const tenantOffers = useMemo(() => offers.filter(o => o.tenantId === currentTenantId), [offers, currentTenantId]);
   const tenantSellers = useMemo(() => sellers.filter(s => s.tenantId === currentTenantId), [sellers, currentTenantId]);
   const tenantClients = useMemo(() => clients.filter(c => c.tenantId === currentTenantId), [clients, currentTenantId]);

   // Inventário Calculado em Tempo Real
   const stones = useMemo(() => {
      return InventoryService.reconcile(tenantStones, tenantDelegations, tenantOffers);
   }, [tenantStones, tenantDelegations, tenantOffers]);

   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [currentUserRole, setCurrentUserRole] = useState<UserRole>('industry_admin');
   const [currentSellerId, setCurrentSellerId] = useState<string>('all');
   const [currentView, setCurrentView] = useState<AppState['currentView']>('dashboard');
   const [activePage, setActivePage] = useState<PageView>('dashboard');
   const [selectedSellerIndustry, setSelectedSellerIndustry] = useState<'all' | string>('all');

   // Toggle para visão da Indústria (Lotes vs Catálogo)
   const [inventoryMode, setInventoryMode] = useState<'lots' | 'catalog'>('lots');
   const [invSearch, setInvSearch] = useState('');
   const [invTypologyFilter, setInvTypologyFilter] = useState('all');
   const [invStatusFilter, setInvStatusFilter] = useState('all');

   const [activeModal, setActiveModal] = useState<{
      type: 'delegate' | 'offer' | 'direct' | 'transaction' | 'seller_inv' | 'industry_inv' | 'typology' | 'batch' | 'client_form' | 'client_details' | 'reservation' | null;
      data?: any;
   }>({ type: null });

   const [showNotifications, setShowNotifications] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const handleNavigate = (page: PageView) => {
      setActivePage(page);
      setIsSidebarOpen(false);
   };

   const renderIndustryPicker = () => {
      if (currentUserRole !== 'seller') return null;
      return (
         <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-xs font-semibold text-slate-600">Indústria</div>
            <select
               value={selectedSellerIndustry}
               onChange={(e) => setSelectedSellerIndustry(e.target.value)}
               className="w-full sm:w-auto border border-slate-300 text-sm font-medium text-slate-700 px-3 py-2 rounded-sm bg-white outline-none transition-all hover:border-[#C2410C] focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/30"
            >
               <option value="all">Todas as indústrias</option>
               {sellerIndustryOptions.map(id => (
                  <option key={id} value={id}>{id}</option>
               ))}
            </select>
         </div>
      );
   };

   const sellerIndustryOptions = useMemo(() => {
      const ids = new Set<string>();
      delegations.forEach(d => {
         if (d.sellerId === currentSellerId) ids.add(d.tenantId);
      });
      offers.forEach(o => {
         if (!o.delegationId) return;
         const del = delegations.find(d => d.id === o.delegationId);
         if (del && del.sellerId === currentSellerId) ids.add(o.tenantId);
      });
      return Array.from(ids);
   }, [delegations, offers, currentSellerId]);

   useEffect(() => {
      setSelectedSellerIndustry('all');
   }, [currentUserRole, currentSellerId]);

   const analyticsDelegations = useMemo(() => {
      if (currentUserRole === 'industry_admin') return tenantDelegations;
      const bySeller = delegations.filter(d => d.sellerId === currentSellerId);
      if (selectedSellerIndustry === 'all') return bySeller;
      return bySeller.filter(d => d.tenantId === selectedSellerIndustry);
   }, [currentUserRole, tenantDelegations, delegations, currentSellerId, selectedSellerIndustry]);

   const analyticsOffers = useMemo(() => {
      if (currentUserRole === 'industry_admin') return tenantOffers;
      const sellerOffers = offers.filter(o => {
         if (!o.delegationId) return false;
         const del = delegations.find(d => d.id === o.delegationId);
         return del && del.sellerId === currentSellerId;
      });
      if (selectedSellerIndustry === 'all') return sellerOffers;
      return sellerOffers.filter(o => o.tenantId === selectedSellerIndustry);
   }, [currentUserRole, tenantOffers, offers, delegations, currentSellerId, selectedSellerIndustry]);

   const analyticsStones = useMemo(() => {
      if (currentUserRole === 'industry_admin') return tenantStones;
      if (selectedSellerIndustry === 'all') return rawStones;
      return rawStones.filter(s => s.tenantId === selectedSellerIndustry);
   }, [currentUserRole, tenantStones, rawStones, selectedSellerIndustry]);

   const analyticsSellers = useMemo(() => {
      return currentUserRole === 'industry_admin' ? tenantSellers : sellers;
   }, [currentUserRole, tenantSellers, sellers]);

   const sellerDelegations = useMemo(() => delegations.filter(d => d.sellerId === currentSellerId), [delegations, currentSellerId]);

   const sellerOffers = useMemo(() => {
      return offers.filter(o => {
         if (!o.delegationId) return false;
         const del = delegations.find(d => d.id === o.delegationId);
         return del && del.sellerId === currentSellerId;
      });
   }, [offers, delegations, currentSellerId]);

   const sellerStones = useMemo(() => {
      return rawStones.filter(s => sellerDelegations.some(d => d.stoneId === s.id));
   }, [rawStones, sellerDelegations]);

   // --- 1. FILTRAGEM CENTRAL (Quem pode ver o quê?) ---
   const visibleOffers = useMemo(() => {
      const list = analyticsOffers || [];
      if (currentUserRole === 'industry_admin') {
         if (currentSellerId === 'all') return list;
         return list.filter(o => {
            if (!o.delegationId) return false;
            const del = analyticsDelegations.find(d => d.id === o.delegationId);
            return del && del.sellerId === currentSellerId;
         });
      } else {
         return list.filter(o => {
            if (!o.delegationId) return false;
            const del = analyticsDelegations.find(d => d.id === o.delegationId);
            return del && del.sellerId === currentSellerId;
         });
      }
   }, [analyticsOffers, currentUserRole, currentSellerId, analyticsDelegations]);

   // --- 2. ENRIQUECIMENTO (Adiciona dados de Stone, Seller e Delegation aos links) ---
   const enrichedOffers = useMemo(() => {
      return visibleOffers.map(o => ({
         offer: o,
         stone: analyticsStones.find(s => s.id === o.stoneId)!,
         seller: o.delegationId ? analyticsSellers.find(s => s.id === analyticsDelegations.find(d => d.id === o.delegationId)?.sellerId) : undefined,
         delegation: analyticsDelegations.find(d => d.id === o.delegationId)
      })).filter(item => item.stone);
   }, [visibleOffers, analyticsStones, analyticsSellers, analyticsDelegations]);

   // --- 3. SEGREGAÇÃO (A Chave para corrigir o bug!) ---
   // Pipeline: ativos, pendentes e reservados
   const pipelineData = useMemo(() =>
      enrichedOffers.filter(item => ['active', 'reservation_pending', 'reserved'].includes(item.offer.status)),
      [enrichedOffers]);

   // Sales e Financials: Apenas o que foi VENDIDO
   const salesData = useMemo(() =>
      enrichedOffers.filter(item => item.offer.status === 'sold'),
      [enrichedOffers]);

   const currentUser = currentUserRole === 'industry_admin'
      ? { name: 'HQ Admin', roleLabel: 'Global Admin' }
      : { name: tenantSellers.find(s => s.id === currentSellerId)?.name || 'Seller', roleLabel: 'Partner' };

   // 4. KPI Calculation (Usa as listas já segregadas para precisão)
   const kpi = useMemo(() => {
      const pipelineRevenue = pipelineData.reduce((sum, item) => sum + (item.offer.finalPrice * item.offer.quantityOffered), 0);
      const soldRevenue = salesData.reduce((sum, item) => sum + (item.offer.finalPrice * item.offer.quantityOffered), 0);
      const reservedLinks = pipelineData.filter(item => item.offer.status === 'reserved').length;

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
         reservedLinks,
         labelProfit: currentUserRole === 'industry_admin' ? t('dash.kpi.profit_admin') : t('dash.kpi.profit_seller')
      };
   }, [pipelineData, salesData, currentUserRole, t]);

   const addNotification = useCallback((msg: string, type: 'info' | 'success' | 'alert' = 'info') => {
      const newNotif: Notification = {
         id: `notif-${Date.now()}`,
         tenantId: currentTenantId,
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
         tenantId: currentTenantId,
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
      setOffers(prev => [{ ...offer, tenantId: offer.tenantId || currentTenantId }, ...prev]);
      addNotification(t('toast.link_ready'), 'success');
      setActiveModal({ type: null });
   };

   const handleFinalizeSale = (offer: OfferLink) => {
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'sold' as const } : o));
      // Se foi venda delegada, abate do saldo do vendedor
      if (offer.delegationId) {
         setDelegations(prev => prev.map(d => d.id === offer.delegationId ? { ...d, delegatedQuantity: Math.max(0, d.delegatedQuantity - offer.quantityOffered) } : d));
      }
      addNotification(t('toast.sale_confirmed', { client: offer.clientName, value: formatCurrency(offer.finalPrice * offer.quantityOffered) }), 'success');
      setActiveModal({ type: null });
   };

   const handleCancelLink = (offer: OfferLink) => {
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'expired' as const } : o));
      addNotification(t('toast.link_cancelled', { client: offer.clientName }), 'alert');
      setActiveModal({ type: null });
   };

   // --- RESERVAS ---

   const requestReservation = (offer: OfferLink, note?: string) => {
      setOffers(prev => prev.map(o => {
         if (o.id !== offer.id) return o;
         return {
            ...o,
            status: 'reservation_pending',
            reservation: {
               requestedByRole: 'seller',
               requestedById: currentSellerId,
               requestedAt: new Date().toISOString(),
               note
            }
         };
      }));
      addNotification(`Reserva solicitada para ${offer.clientName} – aguardando aprovação da indústria.`, 'info');
   };

   const approveReservation = (offer: OfferLink, reviewNote?: string) => {
      const stone = stones.find(s => s.id === offer.stoneId);
      if (!stone) return;
      if (stone.quantity.available < offer.quantityOffered) {
         addNotification(`Não é possível reservar. Disponível: ${stone.quantity.available}.`, 'alert');
         return;
      }
      setOffers(prev => prev.map(o => {
         if (o.id !== offer.id) return o;
         const baseReservation = o.reservation || {
            requestedByRole: 'seller' as UserRole,
            requestedById: currentSellerId,
            requestedAt: new Date().toISOString()
         };
         return {
            ...o,
            status: 'reserved',
            reservation: {
               ...baseReservation,
               reviewedAt: new Date().toISOString(),
               reviewerId: 'admin',
               reviewerRole: 'industry_admin',
               reviewNote
            }
         };
      }));
      addNotification(`Reserva aprovada para ${offer.clientName}. Estoque travado.`, 'success');
   };

   const rejectReservation = (offer: OfferLink, reviewNote?: string) => {
      setOffers(prev => prev.map(o => {
         if (o.id !== offer.id) return o;
         const baseReservation = o.reservation || {
            requestedByRole: 'seller' as UserRole,
            requestedById: currentSellerId,
            requestedAt: new Date().toISOString()
         };
         return {
            ...o,
            status: 'active',
            reservation: {
               ...baseReservation,
               reviewedAt: new Date().toISOString(),
               reviewerId: 'admin',
               reviewerRole: 'industry_admin',
               reviewNote
            }
         };
      }));
      addNotification(`Reserva rejeitada para ${offer.clientName}. Link voltou a ativo.`, 'alert');
   };

   const handleRevokeDelegation = (delegationId: string) => {
      const activeLinkedOffers = tenantOffers.filter(o => o.delegationId === delegationId && ['active', 'reserved', 'reservation_pending'].includes(o.status));
      if (activeLinkedOffers.length > 0) {
         addNotification(t('msg.revoke_block_active'), 'alert');
         return;
      }
      setDelegations(prev => prev.filter(d => d.id !== delegationId));
      addNotification(t('toast.delegation_revoked'), 'info');
      setActiveModal({ type: null });
   };

   const handleSaveClient = (client: Client) => {
      setClients(prev => prev.find(c => c.id === client.id) ? prev.map(c => c.id === client.id ? client : c) : [...prev, { ...client, tenantId: client.tenantId || currentTenantId }]);
      setActiveModal({ type: null });
      addNotification('Registro CRM atualizado.', 'success');
   };

   // --- RENDER HELPERS ---

   const renderInventory = () => {
      const baseStones = currentUserRole === 'industry_admin' ? stones : sellerStones;

      const filteredStones = baseStones.filter(s => {
         const matchesSearch = !invSearch || s.typology.name.toLowerCase().includes(invSearch.toLowerCase()) || s.lotId.toLowerCase().includes(invSearch.toLowerCase());
         const matchesType = invTypologyFilter === 'all' || s.typology.id === invTypologyFilter;

         const isSoldOut = s.quantity.available === 0 && s.quantity.reserved === 0 && s.quantity.sold >= s.quantity.total;

         // Status filter logic (explicit handling for sold-out lots)
         const matchesStatus =
            (invStatusFilter === 'all' && !isSoldOut) ||
            (invStatusFilter === 'available' && s.quantity.available > 0) ||
            (invStatusFilter === 'reserved' && s.quantity.reserved > 0) ||
            (invStatusFilter === 'sold' && isSoldOut);

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
                  {/* View Switcher (Industry Only) */}
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
                        <StoneCard
                           key={s.id}
                           stone={s}
                           role={currentUserRole}
                           delegation={currentUserRole === 'seller' ? sellerDelegations.find(d => d.stoneId === s.id) : undefined}
                           offerCount={currentUserRole === 'seller' ? sellerOffers.filter(o => o.stoneId === s.id).length : undefined}
                           index={i}
                           inventorySnapshot={InventoryService.computeProgressSnapshot(
                              s,
                              currentUserRole === 'industry_admin' ? tenantDelegations : sellerDelegations,
                              currentUserRole === 'industry_admin' ? tenantOffers : sellerOffers
                           )}
                           onClick={() => setActiveModal({ type: currentUserRole === 'industry_admin' ? 'industry_inv' : 'seller_inv', data: currentUserRole === 'industry_admin' ? s : { stone: s, delegation: sellerDelegations.find(d => d.stoneId === s.id) } })}
                           onDelegate={(stone) => setActiveModal({ type: 'delegate', data: stone })}
                           onDirectLink={(stone) => setActiveModal({ type: 'direct', data: stone })}
                        />
                     ))}
                  </div>
               </>
            ) : (
               <CatalogView typologies={typologies} onEditTypology={(typology) => setActiveModal({ type: 'typology', data: typology })} />
            )}
         </div>
      );
   };

   // --- CLIENT VIEW (PUBLIC PAGE) ---
   if (typeof currentView === 'object' && currentView.type === 'client_view') {
      const token = currentView.token;
      const offer = (tenantOffers || []).find(o => o && o.clientViewToken === token);
      if (!offer) return <div className="p-20 text-center font-serif text-2xl">404 - Offer Link Not Found</div>;
      const stone = stones.find(s => s.id === offer.stoneId);
      const seller = offer.delegationId ? tenantSellers.find(s => s.id === tenantDelegations.find(d => d.id === offer.delegationId)?.sellerId) : undefined;
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

   // --- MAIN APP ---
   return (
      <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
         <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            role={currentUserRole}
            currentUserName={currentUser.name}
            currentUserRoleLabel={currentUser.roleLabel}
            isMobileOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
         />

         {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

         <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            {/* Top Bar */}
            <div className="absolute top-6 left-4 z-50 lg:hidden">
               <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 rounded-md bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-[#121212] hover:shadow-md transition-colors">
                  <Menu className="w-5 h-5" />
               </button>
            </div>

            <div className="absolute top-6 right-8 z-50 flex items-center space-x-6">
               <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-400 hover:text-[#121212] transition-colors bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm border border-slate-100">
                     <Bell className="w-5 h-5" />
                     {notifications.some(n => !n.read && n.tenantId === currentTenantId) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white" />}
                  </button>
                  {showNotifications && (
                     <NotificationDropdown
                        notifications={notifications.filter(n => n.tenantId === currentTenantId)}
                        onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                        onMarkAllRead={() => setNotifications(prev => prev.map(n => n.tenantId === currentTenantId ? ({ ...n, read: true }) : n))}
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
                           sellers={tenantSellers}
                           selectedSellerId={currentSellerId}
                           onFilterSeller={setCurrentSellerId}
                           onFinalizeSale={handleFinalizeSale}
                           onCancelLink={handleCancelLink}
                           onApproveReservation={(offer) => setActiveModal({ type: 'reservation', data: { mode: 'approve', offer } })}
                           onRejectReservation={(offer) => setActiveModal({ type: 'reservation', data: { mode: 'reject', offer } })}
                           onNavigate={setActivePage}
                           onSelectTransaction={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                           onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
                        />
                     </div>
                  )}
                  {activePage === 'inventory' && renderInventory()}
                  {activePage === 'lot_history' && (
                     <div className="pt-8 lg:pt-12">
                        <LotHistoryView
                           stones={currentUserRole === 'industry_admin' ? stones : sellerStones}
                           offers={currentUserRole === 'industry_admin' ? tenantOffers : sellerOffers}
                           delegations={currentUserRole === 'industry_admin' ? tenantDelegations : sellerDelegations}
                           sellers={currentUserRole === 'industry_admin' ? tenantSellers : analyticsSellers}
                           onSelectLot={(stone) => setActiveModal({ type: currentUserRole === 'industry_admin' ? 'industry_inv' : 'seller_inv', data: currentUserRole === 'industry_admin' ? stone : { stone, delegation: sellerDelegations.find(d => d.stoneId === stone.id) } })}
                        />
                     </div>
                  )}
                  {activePage === 'clients' && (
                     <div className="pt-8 lg:pt-12">
                        <CRMView
                           clients={tenantClients}
                           offers={currentUserRole === 'industry_admin' ? tenantOffers : sellerOffers}
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
                           // Considera ativos, pendentes e reservados
                           offers={(currentUserRole === 'industry_admin' ? tenantOffers : sellerOffers).filter(o => ['active', 'reservation_pending', 'reserved'].includes(o.status))}
                           stones={currentUserRole === 'industry_admin' ? stones : sellerStones}
                           sellers={currentUserRole === 'industry_admin' ? tenantSellers : analyticsSellers}
                           delegations={currentUserRole === 'industry_admin' ? tenantDelegations : sellerDelegations}
                           role={currentUserRole}
                           onSelectTransaction={(item) => {
                              const relatedStone = (currentUserRole === 'industry_admin' ? stones : sellerStones).find(s => s.id === item?.offer?.stoneId);
                              const relatedSeller = item?.offer?.delegationId ? (currentUserRole === 'industry_admin' ? tenantSellers : analyticsSellers).find(s => s.id === (currentUserRole === 'industry_admin' ? tenantDelegations : sellerDelegations).find(d => d.id === item.offer.delegationId)?.sellerId) : undefined;

                              setActiveModal({
                                 type: 'transaction',
                                 data: {
                                    offer: item.offer,
                                    stone: relatedStone,
                                    seller: relatedSeller,
                                    delegation: (currentUserRole === 'industry_admin' ? tenantDelegations : sellerDelegations).find(d => d.id === item.offer.delegationId)
                                 }
                              });
                           }}
                           onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })}
                        />
                     </div>
                  )}

                  {/* --- ANALYTICS ROUTES: AGORA USANDO DADOS FILTRADOS --- */}

                  {/* 1. PIPELINE (Links Ativos/Pendentes/Reservados) */}
                  {activePage === 'pipeline' && (
                     <div className="pt-8 lg:pt-12">
                        <AnalyticsDetailView
                           title={t('nav.pipeline')}
                           mode="pipeline"
                           role={currentUserRole}
                           data={pipelineData}
                           industrySlot={renderIndustryPicker()}
                           onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                        />
                     </div>
                  )}

                  {/* 2. SALES (Vendas Realizadas) */}
                  {activePage === 'sales' && (
                     <div className="pt-8 lg:pt-12">
                        <AnalyticsDetailView
                           title={t('nav.sales')}
                           mode="sales"
                           role={currentUserRole}
                           data={salesData}
                           industrySlot={renderIndustryPicker()}
                           onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                        />
                     </div>
                  )}

                  {/* 3. FINANCIALS (Lucro Líquido / Comissões) */}
                  {activePage === 'financials' && (
                     <div className="pt-8 lg:pt-12">
                        <AnalyticsDetailView
                           title={t(currentUserRole === 'industry_admin' ? 'nav.financials_admin' : 'nav.financials_seller')}
                           mode="profit"
                           role={currentUserRole}
                           data={salesData}
                           industrySlot={renderIndustryPicker()}
                           onTransactionClick={(tx) => setActiveModal({ type: 'transaction', data: tx })}
                        />
                     </div>
                  )}
               </div>
            </div>

            <ToastContainer notifications={notifications.filter(n => n.tenantId === currentTenantId && !n.read && n.isToast)} onDismiss={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))} />

            {activeModal.type === 'client_form' && <ClientFormModal currentUserId={currentUserRole === 'industry_admin' ? 'admin' : currentSellerId} currentUserRole={currentUserRole} onClose={() => setActiveModal({ type: null })} onSave={handleSaveClient} />}
            {activeModal.type === 'client_details' && <ClientDetailsModal client={activeModal.data} offers={tenantOffers} stones={stones} sellers={tenantSellers} delegations={tenantDelegations} role={currentUserRole} onClose={() => setActiveModal({ type: null })} onSave={handleSaveClient} onViewClientPage={(t) => setCurrentView({ type: 'client_view', token: t })} />}
            {activeModal.type === 'delegate' && <DelegateModal stone={activeModal.data} sellers={tenantSellers} onClose={() => setActiveModal({ type: null })} onConfirm={(selId, qty, p) => handleDelegate(activeModal.data.id, selId, qty, p)} />}
            {activeModal.type === 'direct' && <DirectLinkModal stone={activeModal.data} clients={tenantClients} onClose={() => setActiveModal({ type: null })} onGenerate={(p, q, cId, cN) => {
               const token = Math.random().toString(36).substring(7);
               const newOffer: OfferLink = { id: `off-${Date.now()}`, tenantId: currentTenantId, stoneId: activeModal.data.id, clientId: cId, clientName: cN, finalPrice: p, quantityOffered: q, status: 'active', clientViewToken: token, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), viewLog: [] };
               handleCreateOffer(newOffer);
            }} />}
            {activeModal.type === 'offer' && (
               <OfferModal
                  delegation={activeModal.data.delegation} stone={activeModal.data.stone} clients={tenantClients} maxQuantity={stones.find(s => s.id === activeModal.data.stone.id)?.quantity.available || 0} onClose={() => setActiveModal({ type: null })} onSuccess={handleCreateOffer}
               />
            )}
            {activeModal.type === 'seller_inv' && <SellerInventoryModal delegation={activeModal.data.delegation} stone={activeModal.data.stone} offers={tenantOffers.filter(o => o.delegationId === activeModal.data.delegation.id)} onClose={() => setActiveModal({ type: null })} onCreateOffer={(d) => setActiveModal({ type: 'offer', data: { delegation: d, stone: activeModal.data.stone } })} onViewTransaction={(o) => setActiveModal({ type: 'transaction', data: { offer: o, stone: activeModal.data.stone, delegation: activeModal.data.delegation } })} onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })} onRequestReservation={(offer) => setActiveModal({ type: 'reservation', data: { mode: 'request', offer } })} />}
            {activeModal.type === 'industry_inv' && <IndustryInventoryModal stone={activeModal.data} delegations={tenantDelegations.filter(d => d.stoneId === activeModal.data.id)} offers={tenantOffers.filter(o => o.stoneId === activeModal.data.id)} sellers={tenantSellers} onClose={() => setActiveModal({ type: null })} onViewTransaction={(o) => setActiveModal({ type: 'transaction', data: { offer: o, stone: activeModal.data } })} onUpdateStone={(updated) => setRawStones(prev => prev.map(s => s.id === updated.id ? updated : s))} onDelegate={() => setActiveModal({ type: 'delegate', data: activeModal.data })} onDirectLink={() => setActiveModal({ type: 'direct', data: activeModal.data })} onRevokeDelegation={handleRevokeDelegation} onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })} onReserve={(offer) => setActiveModal({ type: 'reservation', data: { mode: 'approve', offer } })} onFinalizeSale={handleFinalizeSale} />}
            {activeModal.type === 'transaction' && <TransactionDetailsModal transaction={activeModal.data} role={currentUserRole} onClose={() => setActiveModal({ type: null })} onFinalizeSale={handleFinalizeSale} onCancelLink={handleCancelLink} onViewClientPage={(token) => setCurrentView({ type: 'client_view', token })} onRequestReservation={(offer) => setActiveModal({ type: 'reservation', data: { mode: 'request', offer } })} onApproveReservation={(offer) => setActiveModal({ type: 'reservation', data: { mode: 'approve', offer } })} />}
            {activeModal.type === 'reservation' && <ReservationModal mode={activeModal.data.mode} offer={activeModal.data.offer} onCancel={() => setActiveModal({ type: null })} onConfirm={(note) => {
               if (activeModal.data.mode === 'request') requestReservation(activeModal.data.offer, note);
               if (activeModal.data.mode === 'approve') approveReservation(activeModal.data.offer, note);
               if (activeModal.data.mode === 'reject') rejectReservation(activeModal.data.offer, note);
               setActiveModal({ type: null });
            }} />}
            {activeModal.type === 'typology' && <TypologyModal typology={activeModal.data} onClose={() => setActiveModal({ type: null })} onSave={(newType) => setTypologies(prev => activeModal.data ? prev.map(t => t.id === newType.id ? newType : t) : [...prev, newType])} />}
            {activeModal.type === 'batch' && <BatchModal typologies={typologies} tenantId={currentTenantId} onClose={() => setActiveModal({ type: null })} onSave={(newItem) => { setRawStones(prev => [newItem, ...prev]); addNotification(t('toast.batch_added', { id: newItem.lotId }), 'success'); }} />}
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
