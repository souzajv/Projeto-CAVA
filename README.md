# CAVA.

## Resumo

A aplicação é um SPA em React + TypeScript com contexto de idioma, hooks de domínio e componentes específicos para cada papel (indústria e vendedor). Os dados são mockados em memória e encadeados por serviços e hooks para manter regras de estoque e de negociação consistentes.

## Requisitos funcionais

- Gestão de inventário (lotes e catálogo), com filtros, status e visualização por papel (indústria vs. vendedor) em [App.tsx](App.tsx), [components/inventory/InventoryFilters.tsx](components/inventory/InventoryFilters.tsx) e [components/inventory/StoneCard.tsx](components/inventory/StoneCard.tsx).
- Delegação de estoque para parceiros, respeitando saldo disponível e piso de preço, controlado pelo domínio em [App.tsx](App.tsx) e [domain/services/InventoryService.ts](domain/services/InventoryService.ts).
- Geração de links de oferta (indústria e vendedor), validação de preço/quantidade e criação de tokens seguros em [App.tsx](App.tsx) e no hook [hooks/useSellerOffer.ts](hooks/useSellerOffer.ts).
- Ciclo de reservas (solicitar, aprovar, rejeitar) com travamento de estoque e notificações em [App.tsx](App.tsx) e painel de acompanhamento em [components/dashboard/Dashboard.tsx](components/dashboard/Dashboard.tsx).
- Fechamento/cancelamento de vendas com atualização de estoque e delegações em [App.tsx](App.tsx) e visão de pipeline/financeiro em [components/dashboard/Dashboard.tsx](components/dashboard/Dashboard.tsx).
- CRM de clientes (listagem, criação/edição e uso nos links) operado em [App.tsx](App.tsx) e modais dedicados em `components/clients/`.
- Analytics, KPIs e termômetro de interesse baseados em segregação de ofertas/delegações em [App.tsx](App.tsx) e [components/analytics/](components/analytics/).
- Notificações e toasts (avisos de erros, reservas e vendas) disparadas a partir de [App.tsx](App.tsx) e exibidas via [components/layout/NotificationDropdown.tsx](components/layout/NotificationDropdown.tsx) e [components/ui/Toast.tsx](components/ui/Toast.tsx).
- Internacionalização e formatação de datas/moedas providas por [contexts/LanguageContext.tsx](contexts/LanguageContext.tsx).

## Fluxos principais 

- Inventário em tempo real: `InventoryService.reconcile` aplica regras de soft/hard lock e devolve disponibilidade calculada para cada pedra, usado em [App.tsx](App.tsx) e exibido em [components/inventory/StoneCard.tsx](components/inventory/StoneCard.tsx).
- Delegar estoque: `handleDelegate` verifica disponibilidade, cria `SalesDelegation` e gera toast; UI é aberta pela action de delegado em StoneCard (indústria) e modais em `components/offers/DelegateModal.tsx`.
- Criar oferta (vendedor): `useSellerOffer` valida preço acima do piso, limita quantidade ao saldo delegado e gera `OfferLink` com token; acionado por `OfferModal` em [components/offers/OfferModal.tsx](components/offers/OfferModal.tsx).
- Links diretos (indústria): `handleCreateOffer` cria oferta sem delegação e atualiza lista de ofertas, disparando toast; entry point via ações de StoneCard para admin e `DirectLinkModal`.
- Reservas: `requestReservation` altera status para `reservation_pending`; `approveReservation` valida disponibilidade e marca como `reserved`; `rejectReservation` retorna para `active`; painel de pendências renderizado em [components/dashboard/Dashboard.tsx](components/dashboard/Dashboard.tsx).
- Venda e cancelamento: `handleFinalizeSale` marca `sold`, abate delegação quando aplicável e recalcula KPIs; `handleCancelLink` expira link e libera estoque; efeitos visíveis na tabela de transações do dashboard.
- Filtragem por papel e contexto: memos em [App.tsx](App.tsx) segregam dados por tenant, papel do usuário e indústria selecionada, alimentando views (dashboard, pipeline, analytics, CRM, inventário).
- Notificação/alerta: `addNotification` cria registros tanto para dropdown quanto para toasts; eventos são disparados de cada ação de negócio (delegar, reserva, venda, cancelamento, CRM).