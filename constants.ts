
import { StoneItem, Seller, SalesDelegation, OfferLink, StoneTypology, Client } from './types';

export const DEMO_TENANT_ID = 'tenant-001';

export const PLATFORM_DOMAIN = "https://cava.platform";
export const DEFAULT_STONE_IMAGE = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800";

// --- IMAGENS ---
const IMG_CARRARA = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800";
const IMG_NERO = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800";
const IMG_CALACATTA = "https://images.unsplash.com/photo-1617191523662-79b9e69c7333?auto=format&fit=crop&q=80&w=800";

// --- 1. TYPOLOGIES (Catálogo Global) ---
export const MOCK_TYPOLOGIES: StoneTypology[] = [
  {
    id: 'type-01',
    name: 'Carrara Marble Premium',
    description: 'Classic Italian marble with soft grey veining. Ideal for luxury interiors.',
    origin: 'Tuscany, Italy',
    hardness: 'Mohs 3',
    imageUrl: IMG_CARRARA
  },
  {
    id: 'type-02',
    name: 'Nero Marquina',
    description: 'High quality black marble with distinct white veins.',
    origin: 'Spain',
    hardness: 'Mohs 4',
    imageUrl: IMG_NERO
  },
  {
    id: 'type-03',
    name: 'Calacatta Gold',
    description: 'Rare and exclusive white marble with dramatic gold and grey veining.',
    origin: 'Apuan Alps, Italy',
    hardness: 'Mohs 3',
    imageUrl: IMG_CALACATTA
  }
];

// --- 2. CLIENTS (CRM) ---
export const MOCK_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    tenantId: DEMO_TENANT_ID,
    name: 'Roberto Valência',
    company: 'Luxury Mansions Inc.',
    email: 'roberto@luxmansions.com',
    phone: '+55 11 99988-7766',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'admin',
    createdByRole: 'industry_admin',
    notes: 'Arquiteto focado em alto luxo. Compra recorrente.'
  },
  {
    id: 'cli-002',
    tenantId: DEMO_TENANT_ID,
    name: 'Amanda Silveira',
    company: 'Silveira Interiors',
    email: 'amanda@interiors.com',
    phone: '+55 11 98877-6655',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'sel-001',
    createdByRole: 'seller'
  },
  {
    id: 'cli-003',
    tenantId: DEMO_TENANT_ID,
    name: 'Construtora Horizonte',
    company: 'Horizonte Engenharia',
    email: 'compras@horizonte.com',
    phone: '+55 21 3344-5566',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'admin',
    createdByRole: 'industry_admin'
  }
];

// --- 3. SELLERS (Parceiros) ---
export const MOCK_SELLERS: Seller[] = [
  {
    id: 'sel-001',
    tenantId: DEMO_TENANT_ID,
    name: 'John Stone',
    phone: '+1 555 0101',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    inviteStatus: 'accepted',
    invitedById: 'admin',
    invitedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sel-002',
    tenantId: DEMO_TENANT_ID,
    name: 'Sarah Granite',
    phone: '+1 555 0202',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    inviteStatus: 'accepted',
    invitedById: 'admin',
    invitedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// --- 4. INVENTORY (Estoques Físicos) ---
export const MOCK_STONES: StoneItem[] = [
  {
    id: 'inv-001', // Carrara (Tem vendas e ativos)
    tenantId: DEMO_TENANT_ID,
    lotId: 'BLK-2024-CARRARA-01',
    typology: MOCK_TYPOLOGIES[0],
    dimensions: { width: 280, height: 160, thickness: 2, unit: 'cm' },
    imageUrl: IMG_CARRARA,
    baseCost: 1200,
    minPrice: 2000,
    quantity: { total: 30, available: 10, reserved: 10, sold: 10, unit: 'slabs' }
  },
  {
    id: 'inv-002', // Nero (Totalmente vendido - Histórico)
    tenantId: DEMO_TENANT_ID,
    lotId: 'BLK-2023-NERO-OLD',
    typology: MOCK_TYPOLOGIES[1],
    dimensions: { width: 300, height: 180, thickness: 3, unit: 'cm' },
    imageUrl: IMG_NERO,
    baseCost: 1500,
    minPrice: 2500,
    quantity: { total: 10, available: 0, reserved: 0, sold: 10, unit: 'slabs' }
  },
  {
    id: 'inv-003', // Calacatta (Novos ativos)
    tenantId: DEMO_TENANT_ID,
    lotId: 'BLK-2024-CALA-NEW',
    typology: MOCK_TYPOLOGIES[2],
    dimensions: { width: 290, height: 170, thickness: 2, unit: 'cm' },
    imageUrl: IMG_CALACATTA,
    baseCost: 3000,
    minPrice: 5000,
    quantity: { total: 10, available: 5, reserved: 5, sold: 0, unit: 'slabs' }
  }
];

// --- 5. DELEGATIONS (Distribuição) ---
export const MOCK_DELEGATIONS: SalesDelegation[] = [
  {
    id: 'del-001',
    tenantId: DEMO_TENANT_ID,
    stoneId: 'inv-001', // Carrara para John
    sellerId: 'sel-001',
    delegatedQuantity: 15,
    agreedMinPrice: 2200,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'del-002',
    tenantId: DEMO_TENANT_ID,
    stoneId: 'inv-003', // Calacatta para Sarah
    sellerId: 'sel-002',
    delegatedQuantity: 5,
    agreedMinPrice: 5500,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// --- 6. OFFERS (Transações) ---
// TOTAL CHECK:
// ATIVOS: 3 Ofertas (Roberto, Amanda, Construtora em Negociação)
// VENDIDOS: 2 Ofertas (Construtora Fechado, Amanda Fechado)
// TOTAL FINANCEIRO DISTINTO

export const MOCK_OFFERS: OfferLink[] = [
  // --- ATIVOS (Pipeline / Termômetro) ---
  {
    id: 'off-active-1',
    tenantId: DEMO_TENANT_ID,
    delegationId: 'del-001', // John
    stoneId: 'inv-001', // Carrara
    clientId: 'cli-001', // Roberto
    clientName: 'Roberto Valência',
    finalPrice: 2500,
    quantityOffered: 5, // Total: 12,500
    status: 'active',
    clientViewToken: 'token-active-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    viewLog: [{ timestamp: new Date().toISOString(), durationMs: 45000 }] // Hot
  },
  {
    id: 'off-active-2',
    tenantId: DEMO_TENANT_ID,
    delegationId: undefined, // Venda Direta HQ
    stoneId: 'inv-003', // Calacatta
    clientId: 'cli-003', // Construtora
    clientName: 'Construtora Horizonte (Negociação)',
    finalPrice: 6000,
    quantityOffered: 2, // Total: 12,000
    status: 'active',
    clientViewToken: 'token-active-2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    viewLog: [] // Cold
  },
  {
    id: 'off-active-3',
    tenantId: DEMO_TENANT_ID,
    delegationId: 'del-002', // Sarah
    stoneId: 'inv-003', // Calacatta
    clientId: 'cli-002', // Amanda
    clientName: 'Amanda Silveira (Projeto Hall)',
    finalPrice: 6500,
    quantityOffered: 2, // Total: 13,000
    status: 'active',
    clientViewToken: 'token-active-3',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    viewLog: [{ timestamp: new Date().toISOString(), durationMs: 120000 }] // Very Hot
  },

  // --- VENDIDOS (Sales / Financials) ---
  {
    id: 'off-sold-1',
    tenantId: DEMO_TENANT_ID,
    delegationId: 'del-001', // John
    stoneId: 'inv-001', // Carrara
    clientId: 'cli-002', // Amanda
    clientName: 'Amanda Silveira (Finalizado)',
    finalPrice: 2800,
    quantityOffered: 10, // Total: 28,000
    status: 'sold',
    clientViewToken: 'token-sold-1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  },
  {
    id: 'off-sold-2',
    tenantId: DEMO_TENANT_ID,
    delegationId: undefined, // HQ Direto
    stoneId: 'inv-002', // Nero (Lote Esgotado)
    clientId: 'cli-003', // Construtora
    clientName: 'Construtora Horizonte (Obra A)',
    finalPrice: 3000,
    quantityOffered: 10, // Total: 30,000
    status: 'sold',
    clientViewToken: 'token-sold-2',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  },

  // --- EXPIRADOS (Não deve aparecer em Pipeline nem Vendas) ---
  {
    id: 'off-exp-1',
    tenantId: DEMO_TENANT_ID,
    delegationId: 'del-001',
    stoneId: 'inv-001',
    clientId: 'cli-001',
    clientName: 'Roberto Valência (Antigo)',
    finalPrice: 2500,
    quantityOffered: 2,
    status: 'expired',
    clientViewToken: 'token-exp-1',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  }
];
