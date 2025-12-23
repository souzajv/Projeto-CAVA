
import { StoneItem, Seller, SalesDelegation, OfferLink } from './types';

export const MOCK_STONES: StoneItem[] = [
  {
    id: 'inv-001',
    lotId: 'BLK-2024-001',
    typology: {
      id: 'type-01',
      name: 'Carrara Marble Premium',
      description: 'Classic Italian marble with soft grey veining.',
      origin: 'Tuscany, Italy',
      hardness: 'Mohs 3',
      imageUrl: 'https://images.unsplash.com/photo-1565152333068-d065df0e5628?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    dimensions: { width: 280, height: 160, thickness: 2, unit: 'cm' },
    imageUrl: 'https://images.unsplash.com/photo-1565152333068-d065df0e5628?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    baseCost: 1200,
    minPrice: 2000,
    quantity: {
      total: 10,
      available: 6,
      reserved: 4,
      sold: 0,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-002',
    lotId: 'BLK-2024-002',
    typology: {
      id: 'type-02',
      name: 'Nero Marquina',
      description: 'High quality black marble with distinct white veins.',
      origin: 'Basque Country, Spain',
      hardness: 'Mohs 4',
      imageUrl: 'https://images.unsplash.com/photo-1615800001836-9ab767f40d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    dimensions: { width: 300, height: 180, thickness: 2, unit: 'cm' },
    imageUrl: 'https://images.unsplash.com/photo-1615800001836-9ab767f40d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
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
    typology: {
      id: 'type-03',
      name: 'Calacatta Gold',
      description: 'Rare white marble with gold and grey veining.',
      origin: 'Apuan Alps, Italy',
      hardness: 'Mohs 3',
      imageUrl: 'https://images.unsplash.com/photo-1595406122420-a29288d67285?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    dimensions: { width: 260, height: 150, thickness: 3, unit: 'cm' },
    imageUrl: 'https://images.unsplash.com/photo-1595406122420-a29288d67285?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    baseCost: 3000,
    minPrice: 5000,
    quantity: {
      total: 3,
      available: 0,
      reserved: 1,
      sold: 2,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-004',
    lotId: 'BLK-2024-B52',
    typology: {
      id: 'type-04',
      name: 'Travertine Silver',
      description: 'Elegant grey beige travertine.',
      origin: 'Tivoli, Italy',
      hardness: 'Mohs 4',
      imageUrl: 'https://images.unsplash.com/photo-1605218427368-232d9df8b77d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    dimensions: { width: 290, height: 170, thickness: 2, unit: 'cm' },
    imageUrl: 'https://images.unsplash.com/photo-1605218427368-232d9df8b77d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 
    baseCost: 900,
    minPrice: 1500,
    quantity: {
      total: 20,
      available: 15,
      reserved: 5,
      sold: 0,
      unit: 'slabs'
    }
  },
  {
    id: 'inv-005',
    lotId: 'BLK-2023-HIST-01',
    typology: {
      id: 'type-01',
      name: 'Carrara Marble Premium',
      description: 'Classic Italian marble with soft grey veining.',
      origin: 'Tuscany, Italy',
      hardness: 'Mohs 3',
      imageUrl: 'https://images.unsplash.com/photo-1565152333068-d065df0e5628?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    dimensions: { width: 285, height: 165, thickness: 2, unit: 'cm' },
    imageUrl: 'https://images.unsplash.com/photo-1565152333068-d065df0e5628?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    baseCost: 1100,
    minPrice: 1900,
    quantity: {
      total: 8,
      available: 0,
      reserved: 0,
      sold: 8,
      unit: 'slabs'
    }
  }
];

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

export const MOCK_OFFERS: OfferLink[] = [
  // Sold Items (History)
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
  {
    id: 'off-002',
    stoneId: 'inv-005', // History Lot (Direct Sale)
    clientName: 'Grand Hyatt Lobby',
    finalPrice: 2500,
    quantityOffered: 8,
    status: 'sold',
    clientViewToken: 'token-sold-2',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  },
  
  // Active Offers (Pipeline)
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
  {
    id: 'off-004',
    delegationId: 'del-003', // Travertine
    stoneId: 'inv-004',
    clientName: 'Museum Facade',
    finalPrice: 1900,
    quantityOffered: 5,
    status: 'active',
    clientViewToken: 'token-active-2',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    viewLog: []
  }
];
