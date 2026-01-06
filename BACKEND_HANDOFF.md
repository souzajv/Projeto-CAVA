# CAVA Backend Handoff

## Escopo e Objetivo
Documento de referência técnica para o backend: modelagem de dados, regras de negócio atuais no front, fluxos e cálculos que precisam ser implementados no servidor. Tudo é multi-tenant, com `tenantId` obrigatório em entidades de domínio.

## Entidades (domínio)
- Tenant
  - `id`, `name`
  - Notas: raiz de multi-tenant; todo registro de domínio referencia `tenantId` para isolamento lógico.
- StoneTypology
  - `id`, `tenantId`, `name`, `description`, `origin`, `hardness`, `imageUrl`, `technicalFileUrl?`
  - Notas: catálogo de tipologias (granito, mármore, etc.); `technicalFileUrl` é opcional para anexos técnicos; usada como foreign key em StoneItem.
- StoneItem (lote)
  - `id`, `tenantId`, `typologyId`, `lotId`, `dimensions { width, height, thickness, unit: cm|mm|m }`, `imageUrl`, `additionalImages?`, `baseCost`, `minPrice`, `quantity { total, available, reserved, sold, unit: slabs|m2 }`, timestamps opcionais
  - Notas: representa um lote concreto de chapas/metros; `lotId` é identificador humano exibido em UI e histórico; `typologyId` referencia o material; `baseCost` é custo unitário (m2 ou chapa) usado para cálculo de lucro da indústria; `minPrice` é piso de venda direta da indústria e piso para delegações; `quantity` guarda snapshot derivado do reconcile (não editar direto via UI, apenas via service); `dimensions` é para ficha técnica e cálculos de área quando unidade for m2.
- Seller
  - `id`, `tenantId`, `name`, `phone`, `avatarUrl?`, `inviteStatus: pending|accepted|expired`, `invitedById?`, `invitedAt?`, `acceptedAt?`
  - Notas: representa usuários vendedores (mesmo que atendam múltiplas indústrias cada registro é por tenant); `inviteStatus` controla fluxo de convite; `invitedById` aponta para usuário admin que convidou (não modelado no front ainda, backend precisa de user table para chave estrangeira ou referência solta).
- Client
  - `id`, `tenantId`, `name`, `company?`, `email`, `phone`, `createdAt`, `notes?`, `createdById`, `createdByRole: industry_admin|seller`
  - Notas: cliente associado às ofertas; `createdBy*` indicam quem cadastrou (para auditoria e filtros por vendedor); pode ser reutilizado em vários OfferLink.
- SalesDelegation (cota de um vendedor sobre um lote)
  - `id`, `tenantId`, `stoneId`, `sellerId`, `delegatedQuantity`, `agreedMinPrice`, `createdAt`
  - Notas: relaciona um Seller a um StoneItem; `delegatedQuantity` é a quantidade máxima que o seller pode vender daquele lote (unidade acompanha a do StoneItem); `agreedMinPrice` é o piso negociado para o seller (Offer inicial começa 15% acima); consumo de quantidade acontece via OfferLink `reserved` ou `sold` que referenciam essa delegação.
- OfferLink (link de venda)
  - `id`, `tenantId`, `stoneId`, `delegationId?` (null => link direto da indústria), `clientId`, `clientName`, `finalPrice`, `quantityOffered`, `status: active|reservation_pending|reserved|sold|expired`, `clientViewToken` (único para página pública), `createdAt`, `expiresAt?`, `viewLog[] { timestamp, durationMs? }`, `reservation? { requestedByRole, requestedById?, requestedAt, note?, reviewedAt?, reviewerId?, reviewerRole?, reviewNote? }`
  - Notas: representa uma proposta enviada ao cliente; `delegationId` define se é oferta direta (null) ou de seller; `clientName` é mantido como denormalizado para snapshot mesmo que `clientId` exista; `finalPrice` é o preço negociado por unidade; `quantityOffered` deve respeitar estoque e delegação; `clientViewToken` gera URL pública `/view/{token}` e deve ser único; `viewLog` alimenta analytics de interesse; `reservation` captura o fluxo de aprovação quando um seller pede reserva.
- Notification
  - `id`, `tenantId`, `recipientId`, `message`, `type: info|success|alert`, `timestamp`, `read`, `isToast?`
  - Notas: feed de notificações in-app; `recipientId` referencia usuário (admin ou seller); `isToast` indica se também deve aparecer como toast imediato no front.

## Regras de Estoque (InventoryService.reconcile)
- Hard lock: ofertas com status `sold` ou `reserved` abatem do estoque global.
- Soft lock: soma de (ofertas diretas da indústria com status `active` ou `reservation_pending`) + saldo remanescente de cada delegação (delegatedQuantity - consumido por sold/reserved dessa delegação).
- Disponível: `available = max(0, total - soldHard - reservedHard - softReserved)`.
- Visuais: `reserved` do lote mostra soft lock; `sold` mostra sold+reserved hard; `available` mostra saldo final.

## Fluxo de Reserva (Workflow)
- Seller solicita: status do Offer vai para `reservation_pending`; grava `reservation.requestedBy*`.
- Admin aprova: status => `reserved` (hard lock); `reservation.reviewedAt`, `reviewer*`.
- Admin rejeita: status volta para `active`.
- Vendas finais: status => `sold`.

## Ciclo de Vida de OfferLink
1) Criação: via DirectLink (indústria) ou OfferModal (delegado). Status inicial: `active`. `clientViewToken` é único e exposto na URL pública `/view/{token}`.
2) Reserva pendente: `reservation_pending` (pedido de seller).
3) Reserva aprovada: `reserved` (hard lock).
4) Venda finalizada: `sold`.
5) Expiração/cancelamento: `expired`.

## Cálculo de Interesse (useInterestAnalytics)
- Score = `views * 15 + (totalDurationMs / 1000)`; multiplica por 1.5 se última view < 24h, por 1.2 se < 48h.
- Faixas: `hot` > 120 pts, `warm` > 45 pts, senão `cold`.
- Usado para termômetro e ranking de ofertas ativas/pending.

## Hook de Oferta do Seller (useSellerOffer)
- Inicializa preço como 15% acima de `agreedMinPrice` da delegação.
- Validações: preço >= floor; quantidade >=1 e <= `maxQuantity` permitido; clientId e clientName obrigatórios.
- Gera OfferLink (status `active`, expira em +7d, com `clientViewToken`).

## Segmentação no Dashboard
- Pipeline: ofertas com status `active`, `reservation_pending`, `reserved`.
- Sales/Financial: somente `sold`.
- KPI mostra `pipelineRevenue`, `soldRevenue`, `totalProfit` (baseCost para admin; agreedMinPrice para seller), `reservedLinks` (conta status `reserved`).

## Telas/Fluxos principais (o backend precisa expor endpoints compatíveis)
- Inventory (admin): lista/filtra lotes; cria lote (BatchModal) — requer `tenantId` e tipologia; delega lote para seller; gera link direto.
- Seller Inventory: vê sua delegação, cria Offer; solicita reserva; finaliza venda; cancela link.
- Industry Inventory Modal: aprova/rejeita reservas; revoga delegação; cria link direto; atualiza dados do lote (minPrice, baseCost, totalQuantity, lotId).
- Client View: página pública `/view/{token}` — grava `viewLog` com duração e timestamp ao sair.
- CRM: cria/edita clientes; associa ofertas ao cliente; abre client view.
- Interest Thermometer: lista pipeline (`active`/`reservation_pending`) ordenado por interesse.
- Lot History: histórico de ofertas por lote.

### Escopos por persona (reforço)
- **Seller**: todas as telas são filtradas para o seller logado (mock atual: `John Stone`). Ele só vê:
  - Lotes delegados a ele (Inventory/History), com contadores de links e snapshot calculado apenas com suas ofertas/delegações.
  - Ofertas criadas a partir de suas delegações (pipeline/sales/financials/thermometer/CRM). Ofertas diretas da indústria não aparecem na visão do seller.
  - Delegations: apenas as dele; não vê nem manipula as de outros.
- **Industry Admin**: visão global por tenant, sem restrições adicionais.

### Filtro de indústria na visão do Seller (analytics)
- Seller pode atender múltiplas indústrias. Nos relatórios de Links Ativos (pipeline), Vendas Realizadas (sales) e Minhas Comissões (profit), há um seletor de indústria.
- KPIs iniciam agregados (todas as indústrias atendidas pelo seller). Ao selecionar uma indústria, tanto KPIs quanto tabela filtram para `tenantId` escolhido.
- Backend deve permitir consultas por seller com filtro opcional de `tenantId` para pipeline/sales/profit/thermometer.

## Status / Campos obrigatórios
- Sempre incluir `tenantId` em OfferLink, SalesDelegation, StoneItem, Seller, Client, Notification, Typology.
- OfferLink: `clientViewToken` único; `status` de acordo com transições acima.
- SalesDelegation: `delegatedQuantity` não pode ser negativo; consumo ocorre por offers `sold` ou `reserved` dessa delegação.

## Sugestão de Endpoints (alto nível)
- Auth/session (fora do escopo atual do front mockado).
- `/tenants/{id}/typologies` CRUD
- `/tenants/{id}/stones` CRUD + ajustar estoque (admin only)
- `/tenants/{id}/delegations` CRUD (admin)
- `/tenants/{id}/offers` CRUD + ações: requestReservation, approveReservation, rejectReservation, finalizeSale, cancel
- `/public/view/{token}` GET (render/resolve offer) e POST view log (duration)
- `/tenants/{id}/clients` CRUD
- `/tenants/{id}/notifications` CRUD/markRead

## Regras adicionais
- Disponibilidade deve ser validada no servidor ao criar delegação ou offer para evitar oversell.
- Reserva aprovada e venda são hard lock e atualizam estoque imediatamente.
- Expiração de link deve mudar status para `expired` e liberar soft lock.
- `reserved` de lote é derivado (soft lock); ideal persistir locks ou recalcular server-side similar ao `InventoryService.reconcile`.
- `expiresAt` default +7 dias em links criados.

## Arquivos de referência
- Modelos/Tipos: [types.ts](types.ts)
- Serviço de estoque: [domain/services/InventoryService.ts](domain/services/InventoryService.ts)
- Hook interesse: [hooks/useInterestAnalytics.ts](hooks/useInterestAnalytics.ts)
- Hook oferta seller: [hooks/useSellerOffer.ts](hooks/useSellerOffer.ts)
- Fluxos/handlers: [components/App.tsx](components/App.tsx), [components/inventory/IndustryInventoryModal.tsx](components/inventory/IndustryInventoryModal.tsx), [components/offers/OfferModal.tsx](components/offers/OfferModal.tsx), [components/offers/TransactionDetailsModal.tsx](components/offers/TransactionDetailsModal.tsx)

## O que o backend precisa garantir
- Transações atômicas para atualizar estoque, ofertas e delegações.
- Verificações de quantidade antes de criar/atualizar Offer/Delegation/Reservation.
- Geração segura de `clientViewToken` e URLs públicas.
- Logs de visualização persistidos para analytics.
- Políticas multi-tenant (todas as queries filtradas por `tenantId`).
- Auditoria mínima: timestamps de criação/atualização e usuário/role que executou.

## Gaps/Observações
- Auth/identidade não está implementada no front mock; backend deve definir modelo de usuário e permissões.
- Invite de seller é só estado mockado; backend precisa de fluxo de convite/aceite.
- Não há persistência real de `viewLog`; hoje é in-memory.
- Tipologia `technicalFileUrl` não usada no UI, mas prevista para anexos.
