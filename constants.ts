
import { StoneItem, Seller } from './types';

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
      imageUrl: 'https://picsum.photos/id/1036/800/600'
    },
    dimensions: { width: 280, height: 160, thickness: 2, unit: 'cm' },
    imageUrl: 'https://picsum.photos/id/1036/800/600',
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
      imageUrl: 'https://picsum.photos/id/1016/800/600'
    },
    dimensions: { width: 300, height: 180, thickness: 2, unit: 'cm' },
    imageUrl: 'https://picsum.photos/id/1016/800/600',
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
      imageUrl: 'https://picsum.photos/id/1015/800/600'
    },
    dimensions: { width: 260, height: 150, thickness: 3, unit: 'cm' },
    imageUrl: 'https://picsum.photos/id/1015/800/600',
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
      imageUrl: 'https://picsum.photos/id/1000/800/600'
    },
    dimensions: { width: 290, height: 170, thickness: 2, unit: 'cm' },
    imageUrl: 'https://picsum.photos/id/1000/800/600', 
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
      imageUrl: 'https://picsum.photos/id/1036/800/600'
    },
    dimensions: { width: 285, height: 165, thickness: 2, unit: 'cm' },
    imageUrl: 'https://picsum.photos/id/1036/800/600',
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
    avatarUrl: 'https://picsum.photos/id/64/100/100'
  },
  {
    id: 'sel-002',
    name: 'Sarah Granite',
    phone: '+1 555 0202',
    avatarUrl: 'https://picsum.photos/id/65/100/100'
  }
];
