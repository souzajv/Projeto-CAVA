
import { StoneItem, Seller, SalesDelegation, OfferLink, StoneTypology } from './types';

// --- IMAGE SOURCE CONSTANTS ---
// New stable Unsplash texture URLs - Updated Set
// Carrara (Confirmed Working)
const IMG_CARRARA = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800";
// Nero Marquina (Dark Black Marble)
const IMG_NERO = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800";
// Calacatta (White with distinct grey/gold veins)
const IMG_CALACATTA = "https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&q=80&w=800";
// Travertine (Beige/Textured)
const IMG_TRAVERTINE = "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=800";

// Extra detail shots for carousel
const IMG_DETAIL_1 = "https://images.unsplash.com/photo-1566373151820-22e519c2eb71?auto=format&fit=crop&q=80&w=800";
const IMG_DETAIL_2 = "https://images.unsplash.com/photo-1617135016259-8667c43df793?auto=format&fit=crop&q=80&w=800";

// --- 1. CATALOG (Domain Entities) ---
export const MOCK_TYPOLOGIES: StoneTypology[] = [
  {
    id: 'type-01',
    name: 'Carrara Marble Premium',
    description: 'Classic Italian marble with soft grey veining. Ideal for luxury interiors and timeless designs.',
    origin: 'Tuscany, Italy',
    hardness: 'Mohs 3',
    imageUrl: IMG_CARRARA
  },
  {
    id: 'type-02',
    name: 'Nero Marquina',
    description: 'High quality black marble with distinct white veins. A statement piece for modern architecture.',
    origin: 'Basque Country, Spain',
    hardness: 'Mohs 4',
    imageUrl: IMG_NERO
  },
  {
    id: 'type-03',
    name: 'Calacatta Gold',
    description: 'Rare white marble with gold and grey veining. The epitome of elegance.',
    origin: 'Apuan Alps, Italy',
    hardness: 'Mohs 3',
    imageUrl: IMG_CALACATTA
  },
  {
    id: 'type-04',
    name: 'Travertine Silver',
    description: 'Elegant grey beige travertine with distinct linear patterns.',
    origin: 'Tivoli, Italy',
    hardness: 'Mohs 4',
    imageUrl: IMG_TRAVERTINE
  }
];

// --- 2. SELLERS (Partners) ---
export const MOCK_SELLERS: Seller[] = [
  {
    id: 'sel-001',
    name: 'John Stone',
    phone: '+1 555 0101',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'sel-002',
    name: 'Sarah Granite',
    phone: '+1 555 0202',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

// --- 3. INVENTORY (Physical Stock) ---
// Note: 'available', 'reserved', 'sold' are calculated dynamically in App.tsx.
// We only strictly define 'total' here.
export const MOCK_STONES: StoneItem[] = [
  {
    id: 'inv-001',
    lotId: 'BLK-2024-001',
    typology: MOCK_TYPOLOGIES[0], // Carrara
    dimensions: { width: 280, height: 160, thickness: 2, unit: 'cm' },
    imageUrl: IMG_CARRARA, 
    additionalImages: [IMG_DETAIL_1, IMG_DETAIL_2], // Added mock details
    baseCost: 1200,
    minPrice: 2000,
    quantity: {
      total: 10,
      available: 10, 
      reserved: 0,
      sold: 0,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-002',
    lotId: 'BLK-2024-002',
    typology: MOCK_TYPOLOGIES[1], // Nero
    dimensions: { width: 300, height: 180, thickness: 2, unit: 'cm' },
    imageUrl: IMG_NERO, 
    additionalImages: [IMG_DETAIL_2],
    baseCost: 1800,
    minPrice: 3500,
    quantity: {
      total: 5,
      available: 5,
      reserved: 0,
      sold: 0,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-003',
    lotId: 'BLK-2023-X99',
    typology: MOCK_TYPOLOGIES[2], // Calacatta
    dimensions: { width: 260, height: 150, thickness: 3, unit: 'cm' },
    imageUrl: IMG_CALACATTA, 
    additionalImages: [IMG_DETAIL_1, IMG_CARRARA],
    baseCost: 3000,
    minPrice: 5000,
    quantity: {
      total: 3,
      available: 3,
      reserved: 0,
      sold: 0,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-004',
    lotId: 'BLK-2024-B52',
    typology: MOCK_TYPOLOGIES[3], // Travertine
    dimensions: { width: 290, height: 170, thickness: 2, unit: 'cm' },
    imageUrl: IMG_TRAVERTINE, 
    baseCost: 900,
    minPrice: 1500,
    quantity: {
      total: 20,
      available: 20,
      reserved: 0,
      sold: 0,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-005',
    lotId: 'BLK-2023-HIST-01',
    typology: MOCK_TYPOLOGIES[0], // Carrara (Historic Batch)
    dimensions: { width: 285, height: 165, thickness: 2, unit: 'cm' },
    imageUrl: IMG_CARRARA, 
    baseCost: 1100,
    minPrice: 1900,
    quantity: {
      total: 8,
      available: 8,
      reserved: 0,
      sold: 0,
      unit: 'slabs'
    }
  }
];

// --- 4. DELEGATIONS (B2B Logic) ---
export const MOCK_DELEGATIONS: SalesDelegation[] = [
  {
    id: 'del-001',
    stoneId: 'inv-001', // Carrara
    sellerId: 'sel-001', // John
    delegatedQuantity: 5,
    agreedMinPrice: 2200,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'del-002',
    stoneId: 'inv-002', // Nero
    sellerId: 'sel-002', // Sarah
    delegatedQuantity: 3,
    agreedMinPrice: 3800,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'del-003',
    stoneId: 'inv-004', // Travertine
    sellerId: 'sel-001', // John
    delegatedQuantity: 10,
    agreedMinPrice: 1600,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// --- 5. OFFERS & TRANSACTIONS (B2C Logic) ---
export const MOCK_OFFERS: OfferLink[] = [
  // 1. History (Sold) - John's Deal
  {
    id: 'off-001',
    delegationId: 'del-001', 
    stoneId: 'inv-001',
    clientName: 'Villa Roma Project',
    finalPrice: 2800,
    quantityOffered: 2, 
    status: 'sold',
    clientViewToken: 'token-sold-1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: [{ timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), durationMs: 120000 }]
  },

  // 2. Direct Sale by Industry (John should NOT see this in his pipeline/thermometer)
  {
    id: 'off-002',
    delegationId: undefined, // DIRECT SALE (No Delegation)
    stoneId: 'inv-005', 
    clientName: 'Grand Hyatt Lobby',
    finalPrice: 2500,
    quantityOffered: 8, 
    status: 'sold',
    clientViewToken: 'token-sold-2',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  },
  
  // 3. Active - John's Deal
  {
    id: 'off-003',
    delegationId: 'del-001',
    stoneId: 'inv-001',
    clientName: 'Downtown Penthouse',
    finalPrice: 2950,
    quantityOffered: 1,
    status: 'active',
    clientViewToken: 'token-active-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: [
        { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), durationMs: 15000 },
        { timestamp: new Date().toISOString(), durationMs: 45000 }
    ]
  },

  // 4. Active - John's Deal
  {
    id: 'off-004',
    delegationId: 'del-003', 
    stoneId: 'inv-004',
    clientName: 'Museum Facade',
    finalPrice: 1900,
    quantityOffered: 5,
    status: 'active',
    clientViewToken: 'token-active-2',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  },

  // 5. Active - Sarah's Deal (John should NOT see this)
  {
    id: 'off-005',
    delegationId: 'del-002', 
    stoneId: 'inv-002',
    clientName: 'Modernist Kitchen',
    finalPrice: 4200,
    quantityOffered: 2,
    status: 'active',
    clientViewToken: 'token-active-3',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  }
];
