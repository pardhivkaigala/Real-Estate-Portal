/**
 * data.js - Initial Sample Real Estate Dataset
 * Persisted to localStorage on first load so Admin CRUD modifications are saved.
 */

const INITIAL_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Modern Sunset Luxury Villa',
    slug: 'modern-sunset-luxury-villa',
    purpose: 'buy', // 'buy' or 'rent'
    type: 'Villa',
    price: 1850000,
    priceLabel: '$1,850,000',
    location: 'Beverly Hills, CA',
    city: 'Los Angeles',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 4800,
    featured: true,
    yearBuilt: 2023,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An architectural masterpiece featuring breathtaking panoramic city views, an infinity saltwater pool, open-concept living area with floor-to-ceiling glass walls, automated smart-home systems, and a private wine cellar.',
    amenities: ['Infinity Pool', 'Smart Home', 'Private Gym', 'Wine Cellar', '3-Car Garage', 'Solar Panels', 'Security System'],
    owner: {
      name: 'Alexander Wright',
      email: 'a.wright@havenreal.com',
      phone: '+1 (310) 555-0192',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      agency: 'Wright & Associates Luxury'
    },
    createdAt: '2026-07-15T10:00:00Z'
  },
  {
    id: 'prop-2',
    title: 'Skyline Downtown Penthouse',
    slug: 'skyline-downtown-penthouse',
    purpose: 'buy',
    type: 'Penthouse',
    price: 1250000,
    priceLabel: '$1,250,000',
    location: 'Manhattan, NY',
    city: 'New York',
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 2600,
    featured: true,
    yearBuilt: 2022,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ultra-contemporary skyline penthouse with 14-foot ceilings, a 500 sqft wraparound terrace overlooking Central Park, custom Italian marble kitchen, and 24/7 concierge service.',
    amenities: ['Wraparound Terrace', '24/7 Concierge', 'Elevator Direct Access', 'Valet Parking', 'Pet Friendly'],
    owner: {
      name: 'Sophia Chen',
      email: 'sophia@metroresidences.com',
      phone: '+1 (212) 555-0144',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      agency: 'Metro Residences NYC'
    },
    createdAt: '2026-07-20T12:30:00Z'
  },
  {
    id: 'prop-3',
    title: 'Cozy Waterfront Family Cottage',
    slug: 'cozy-waterfront-family-cottage',
    purpose: 'rent',
    type: 'House',
    price: 4500,
    priceLabel: '$4,500 / mo',
    location: 'Sausalito, CA',
    city: 'San Francisco',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    featured: false,
    yearBuilt: 2019,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Charming waterfront house offering private dock access, hardwood oak floors, vaulted ceilings, and a serene garden deck. Perfect for families looking for quiet luxury close to the city.',
    amenities: ['Private Dock', 'Garden Deck', 'Fireplace', 'Hardwood Floors', 'EV Charger'],
    owner: {
      name: 'Marcus Vance',
      email: 'm.vance@bayproperties.com',
      phone: '+1 (415) 555-0188',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      agency: 'Bay Area Waterfront Homes'
    },
    createdAt: '2026-07-22T09:15:00Z'
  },
  {
    id: 'prop-4',
    title: 'Minimalist Industrial Art Loft',
    slug: 'minimalist-industrial-art-loft',
    purpose: 'rent',
    type: 'Apartment',
    price: 3200,
    priceLabel: '$3,200 / mo',
    location: 'West Loop, Chicago',
    city: 'Chicago',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1400,
    featured: false,
    yearBuilt: 2021,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Authentic industrial loft converted with exposed brick walls, timber beams, polished concrete floors, and designer culinary kitchen. Short walk to transit and fine dining.',
    amenities: ['Exposed Brick', 'High Ceilings', 'In-unit Laundry', 'Rooftop Lounge Access', 'Bike Storage'],
    owner: {
      name: 'Elena Rostova',
      email: 'elena@midwestlofts.com',
      phone: '+1 (312) 555-0176',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      agency: 'Midwest Urban Living'
    },
    createdAt: '2026-07-25T14:00:00Z'
  },
  {
    id: 'prop-5',
    title: 'Pacific Beachfront Estate',
    slug: 'pacific-beachfront-estate',
    purpose: 'buy',
    type: 'Villa',
    price: 3400000,
    priceLabel: '$3,400,000',
    location: 'Malibu, CA',
    city: 'Los Angeles',
    bedrooms: 6,
    bathrooms: 7,
    sqft: 6200,
    featured: true,
    yearBuilt: 2024,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Direct beachfront estate with private stairs to sandy shore. Features a resort-style pool patio, guest house, theater room, and gourmet chef kitchen with imported appliances.',
    amenities: ['Beach Access', 'Home Theater', 'Guest House', 'Heated Pool', 'Smart Security', 'Spa'],
    owner: {
      name: 'Alexander Wright',
      email: 'a.wright@havenreal.com',
      phone: '+1 (310) 555-0192',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      agency: 'Wright & Associates Luxury'
    },
    createdAt: '2026-07-28T16:20:00Z'
  },
  {
    id: 'prop-6',
    title: 'Executive Glass Office Suite',
    slug: 'executive-glass-office-suite',
    purpose: 'rent',
    type: 'Commercial',
    price: 8500,
    priceLabel: '$8,500 / mo',
    location: 'Financial District, SF',
    city: 'San Francisco',
    bedrooms: 0,
    bathrooms: 4,
    sqft: 3500,
    featured: false,
    yearBuilt: 2020,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Turnkey commercial workspace with 8 glass-partitioned private offices, 2 conference rooms with AV setup, soundproof booths, and fiber-optic gigabit internet.',
    amenities: ['Fiber Internet', 'Conference Rooms', '24/7 Security', 'Pantry & Coffee Bar', 'Underground Parking'],
    owner: {
      name: 'Marcus Vance',
      email: 'm.vance@bayproperties.com',
      phone: '+1 (415) 555-0188',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      agency: 'Bay Area Commercial Realty'
    },
    createdAt: '2026-07-29T11:45:00Z'
  },
  {
    id: 'prop-7',
    title: 'Emerald Garden Modern Duplex',
    slug: 'emerald-garden-modern-duplex',
    purpose: 'buy',
    type: 'House',
    price: 890000,
    priceLabel: '$890,000',
    location: 'Austin, TX',
    city: 'Austin',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2950,
    featured: false,
    yearBuilt: 2023,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Eco-friendly modern duplex with solar roof installation, xeriscaped private courtyard garden, open living room with oak staircases, and 2-car garage with fast EV charging.',
    amenities: ['Solar Roof', 'EV Charging', 'Courtyard Garden', 'Smart Thermostat', 'Hardwood Oak'],
    owner: {
      name: 'David Alvarez',
      email: 'd.alvarez@texashomes.com',
      phone: '+1 (512) 555-0131',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      agency: 'Austin Hill Country Living'
    },
    createdAt: '2026-07-30T15:10:00Z'
  }
];

const INITIAL_INQUIRIES = [
  {
    id: 'inq-1',
    propertyId: 'prop-1',
    propertyTitle: 'Modern Sunset Luxury Villa',
    userName: 'James Thornton',
    userEmail: 'j.thornton@example.com',
    userPhone: '+1 (415) 888-2190',
    message: 'Hello, I am interested in booking a private viewing for this villa this upcoming Thursday afternoon.',
    createdAt: '2026-07-28T18:00:00Z',
    status: 'new'
  },
  {
    id: 'inq-2',
    propertyId: 'prop-2',
    propertyTitle: 'Skyline Downtown Penthouse',
    userName: 'Clara Oswald',
    userEmail: 'clara@oswaldconsulting.com',
    userPhone: '+1 (212) 999-4400',
    message: 'Can you confirm if the HOA fees include concierge and valet parking? Also interested in the virtual tour.',
    createdAt: '2026-07-29T14:20:00Z',
    status: 'contacted'
  }
];

// Initialize localStorage if empty
if (!localStorage.getItem('haven_properties')) {
  localStorage.setItem('haven_properties', JSON.stringify(INITIAL_PROPERTIES));
}
if (!localStorage.getItem('haven_favorites')) {
  localStorage.setItem('haven_favorites', JSON.stringify(['prop-1', 'prop-5']));
}
if (!localStorage.getItem('haven_inquiries')) {
  localStorage.setItem('haven_inquiries', JSON.stringify(INITIAL_INQUIRIES));
}
