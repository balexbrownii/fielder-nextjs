/**
 * US Growing Regions
 *
 * Major agricultural regions for the MVP crop set.
 * These will be seeded to Supabase but are also available
 * as TypeScript constants for local operations.
 */

export interface ClimateData {
  avgLastFrostDoy: number   // Day of year for last spring frost
  avgFirstFrostDoy: number  // Day of year for first fall frost
  frostFreeDays: number
  annualGdd50?: number      // GDD accumulation (base 50F)
  avgChillHours?: number    // Hours below 45F
  usdaZone?: string
}

export interface GrowingRegion {
  id: string
  name: string
  displayName: string
  state: string
  latitude: number
  longitude: number
  climate: ClimateData
  viableCrops: string[]
}

export const US_GROWING_REGIONS: Record<string, GrowingRegion> = {
  // === SOUTHEAST ===
  indian_river: {
    id: 'indian_river',
    name: 'Indian River District',
    displayName: 'Indian River District',
    state: 'FL',
    latitude: 27.6,
    longitude: -80.4,
    climate: {
      avgLastFrostDoy: 45,
      avgFirstFrostDoy: 350,
      frostFreeDays: 305,
      annualGdd50: 5500,
      avgChillHours: 150,
      usdaZone: '10'
    },
    viableCrops: ['navel_orange', 'grapefruit', 'tangerine', 'valencia']
  },
  central_florida: {
    id: 'central_florida',
    name: 'Central Florida',
    displayName: 'Central Florida',
    state: 'FL',
    latitude: 28.5,
    longitude: -81.4,
    climate: {
      avgLastFrostDoy: 52,
      avgFirstFrostDoy: 340,
      frostFreeDays: 288,
      annualGdd50: 5200,
      avgChillHours: 200,
      usdaZone: '9'
    },
    viableCrops: ['navel_orange', 'strawberry', 'blueberry']
  },
  south_florida: {
    id: 'south_florida',
    name: 'South Florida (Miami-Dade/Homestead)',
    displayName: 'South Florida',
    state: 'FL',
    latitude: 25.5,
    longitude: -80.4,
    climate: {
      avgLastFrostDoy: 15,
      avgFirstFrostDoy: 365,
      frostFreeDays: 350,
      annualGdd50: 7000,
      avgChillHours: 50,
      usdaZone: '10'
    },
    viableCrops: ['mango']
  },
  sweet_valley: {
    id: 'sweet_valley',
    name: 'Sweet Valley (FL Panhandle / S. Alabama / S. Georgia)',
    displayName: 'Sweet Valley',
    state: 'FL',
    latitude: 30.5,
    longitude: -86.5,
    climate: {
      avgLastFrostDoy: 60,
      avgFirstFrostDoy: 330,
      frostFreeDays: 270,
      annualGdd50: 4200,
      avgChillHours: 450,
      usdaZone: '9'
    },
    viableCrops: ['satsuma', 'navel_orange', 'pecan', 'blueberry']
  },
  georgia_piedmont: {
    id: 'georgia_piedmont',
    name: 'Georgia Piedmont (Peach Belt)',
    displayName: 'Georgia Piedmont',
    state: 'GA',
    latitude: 32.8,
    longitude: -83.6,
    climate: {
      avgLastFrostDoy: 90,
      avgFirstFrostDoy: 310,
      frostFreeDays: 220,
      annualGdd50: 3800,
      avgChillHours: 700,
      usdaZone: '8'
    },
    viableCrops: ['peach', 'blueberry', 'pecan']
  },

  // === TEXAS/SOUTHWEST ===
  texas_rgv: {
    id: 'texas_rgv',
    name: 'Texas Rio Grande Valley',
    displayName: 'Texas RGV',
    state: 'TX',
    latitude: 26.2,
    longitude: -98.2,
    climate: {
      avgLastFrostDoy: 35,
      avgFirstFrostDoy: 355,
      frostFreeDays: 320,
      annualGdd50: 6000,
      avgChillHours: 200,
      usdaZone: '9'
    },
    viableCrops: ['grapefruit', 'navel_orange', 'tangerine']
  },
  texas_hill_country: {
    id: 'texas_hill_country',
    name: 'Texas Hill Country',
    displayName: 'Texas Hill Country',
    state: 'TX',
    latitude: 30.3,
    longitude: -98.5,
    climate: {
      avgLastFrostDoy: 80,
      avgFirstFrostDoy: 320,
      frostFreeDays: 240,
      annualGdd50: 4200,
      avgChillHours: 500,
      usdaZone: '8'
    },
    viableCrops: ['peach', 'pecan']
  },
  texas_pecan_belt: {
    id: 'texas_pecan_belt',
    name: 'Texas Pecan Belt (Central)',
    displayName: 'Texas Pecan Belt',
    state: 'TX',
    latitude: 31.5,
    longitude: -97.0,
    climate: {
      avgLastFrostDoy: 75,
      avgFirstFrostDoy: 320,
      frostFreeDays: 245,
      annualGdd50: 4500,
      avgChillHours: 600,
      usdaZone: '8'
    },
    viableCrops: ['pecan']
  },

  // === CALIFORNIA ===
  california_central_valley: {
    id: 'california_central_valley',
    name: 'California Central Valley (Fresno/Visalia)',
    displayName: 'CA Central Valley',
    state: 'CA',
    latitude: 36.7,
    longitude: -119.8,
    climate: {
      avgLastFrostDoy: 60,
      avgFirstFrostDoy: 335,
      frostFreeDays: 275,
      annualGdd50: 5000,
      avgChillHours: 600,
      usdaZone: '9'
    },
    viableCrops: ['peach', 'navel_orange', 'pomegranate', 'sweet_cherry', 'apple']
  },
  california_coastal: {
    id: 'california_coastal',
    name: 'California Central Coast (Watsonville)',
    displayName: 'CA Central Coast',
    state: 'CA',
    latitude: 36.9,
    longitude: -121.8,
    climate: {
      avgLastFrostDoy: 45,
      avgFirstFrostDoy: 355,
      frostFreeDays: 310,
      annualGdd50: 2500,
      avgChillHours: 1000,
      usdaZone: '9'
    },
    viableCrops: ['strawberry', 'apple']
  },
  california_southern_desert: {
    id: 'california_southern_desert',
    name: 'California Southern Desert (Coachella)',
    displayName: 'Coachella Valley',
    state: 'CA',
    latitude: 33.7,
    longitude: -116.2,
    climate: {
      avgLastFrostDoy: 30,
      avgFirstFrostDoy: 350,
      frostFreeDays: 320,
      annualGdd50: 6500,
      avgChillHours: 200,
      usdaZone: '10'
    },
    viableCrops: ['navel_orange', 'grapefruit']
  },

  // === PACIFIC NORTHWEST ===
  pacific_nw_yakima: {
    id: 'pacific_nw_yakima',
    name: 'Washington Yakima Valley',
    displayName: 'Yakima Valley',
    state: 'WA',
    latitude: 46.6,
    longitude: -120.5,
    climate: {
      avgLastFrostDoy: 120,
      avgFirstFrostDoy: 290,
      frostFreeDays: 170,
      annualGdd50: 2400,
      avgChillHours: 1200,
      usdaZone: '6'
    },
    viableCrops: ['apple', 'sweet_cherry', 'pear']
  },
  pacific_nw_wenatchee: {
    id: 'pacific_nw_wenatchee',
    name: 'Washington Wenatchee Valley',
    displayName: 'Wenatchee Valley',
    state: 'WA',
    latitude: 47.4,
    longitude: -120.3,
    climate: {
      avgLastFrostDoy: 115,
      avgFirstFrostDoy: 285,
      frostFreeDays: 170,
      annualGdd50: 2300,
      avgChillHours: 1300,
      usdaZone: '6'
    },
    viableCrops: ['apple', 'cherry', 'pear']
  },
  pacific_nw_hood_river: {
    id: 'pacific_nw_hood_river',
    name: 'Oregon Hood River Valley',
    displayName: 'Hood River Valley',
    state: 'OR',
    latitude: 45.7,
    longitude: -121.5,
    climate: {
      avgLastFrostDoy: 110,
      avgFirstFrostDoy: 290,
      frostFreeDays: 180,
      annualGdd50: 2200,
      avgChillHours: 1100,
      usdaZone: '7'
    },
    viableCrops: ['pear', 'apple', 'cherry']
  },

  // === MIDWEST ===
  michigan_west: {
    id: 'michigan_west',
    name: 'West Michigan (Grand Traverse/Leelanau)',
    displayName: 'West Michigan',
    state: 'MI',
    latitude: 44.8,
    longitude: -85.6,
    climate: {
      avgLastFrostDoy: 135,
      avgFirstFrostDoy: 275,
      frostFreeDays: 140,
      annualGdd50: 2600,
      avgChillHours: 1400,
      usdaZone: '5'
    },
    viableCrops: ['tart_cherry', 'sweet_cherry', 'apple', 'blueberry']
  },
  michigan_southwest: {
    id: 'michigan_southwest',
    name: 'Southwest Michigan (Berrien County)',
    displayName: 'SW Michigan',
    state: 'MI',
    latitude: 42.0,
    longitude: -86.5,
    climate: {
      avgLastFrostDoy: 130,
      avgFirstFrostDoy: 280,
      frostFreeDays: 150,
      annualGdd50: 2800,
      avgChillHours: 1200,
      usdaZone: '6'
    },
    viableCrops: ['blueberry', 'apple', 'peach']
  },
  wisconsin_door_county: {
    id: 'wisconsin_door_county',
    name: 'Wisconsin Door County',
    displayName: 'Door County',
    state: 'WI',
    latitude: 45.0,
    longitude: -87.2,
    climate: {
      avgLastFrostDoy: 140,
      avgFirstFrostDoy: 270,
      frostFreeDays: 130,
      annualGdd50: 2400,
      avgChillHours: 1500,
      usdaZone: '5'
    },
    viableCrops: ['tart_cherry', 'apple']
  },

  // === NORTHEAST ===
  new_york_hudson_valley: {
    id: 'new_york_hudson_valley',
    name: 'New York Hudson Valley',
    displayName: 'Hudson Valley',
    state: 'NY',
    latitude: 41.7,
    longitude: -73.9,
    climate: {
      avgLastFrostDoy: 120,
      avgFirstFrostDoy: 290,
      frostFreeDays: 170,
      annualGdd50: 2600,
      avgChillHours: 1100,
      usdaZone: '6'
    },
    viableCrops: ['apple', 'blueberry']
  },
  new_york_finger_lakes: {
    id: 'new_york_finger_lakes',
    name: 'New York Finger Lakes',
    displayName: 'Finger Lakes',
    state: 'NY',
    latitude: 42.5,
    longitude: -76.5,
    climate: {
      avgLastFrostDoy: 125,
      avgFirstFrostDoy: 280,
      frostFreeDays: 155,
      annualGdd50: 2400,
      avgChillHours: 1200,
      usdaZone: '6'
    },
    viableCrops: ['apple', 'blueberry', 'tart_cherry']
  },
  pennsylvania_adams_county: {
    id: 'pennsylvania_adams_county',
    name: 'Pennsylvania Adams County (Gettysburg)',
    displayName: 'Adams County',
    state: 'PA',
    latitude: 39.8,
    longitude: -77.2,
    climate: {
      avgLastFrostDoy: 115,
      avgFirstFrostDoy: 290,
      frostFreeDays: 175,
      annualGdd50: 2700,
      avgChillHours: 1000,
      usdaZone: '6'
    },
    viableCrops: ['apple', 'peach', 'blueberry']
  },
  new_jersey_pine_barrens: {
    id: 'new_jersey_pine_barrens',
    name: 'New Jersey Pine Barrens',
    displayName: 'Pine Barrens',
    state: 'NJ',
    latitude: 39.8,
    longitude: -74.5,
    climate: {
      avgLastFrostDoy: 115,
      avgFirstFrostDoy: 290,
      frostFreeDays: 175,
      annualGdd50: 2800,
      avgChillHours: 1000,
      usdaZone: '7'
    },
    viableCrops: ['blueberry']
  },

  // === GULF COAST ===
  gulf_coast_citrus: {
    id: 'gulf_coast_citrus',
    name: 'Gulf Coast Citrus (Louisiana/Mississippi)',
    displayName: 'Gulf Coast',
    state: 'LA',
    latitude: 30.0,
    longitude: -90.0,
    climate: {
      avgLastFrostDoy: 60,
      avgFirstFrostDoy: 330,
      frostFreeDays: 270,
      annualGdd50: 4800,
      avgChillHours: 400,
      usdaZone: '9'
    },
    viableCrops: ['satsuma', 'meyer_lemon']
  },

  // === NEW ENGLAND ===
  new_england: {
    id: 'new_england',
    name: 'New England (Vermont/Massachusetts)',
    displayName: 'New England',
    state: 'VT',
    latitude: 44.0,
    longitude: -72.7,
    climate: {
      avgLastFrostDoy: 130,
      avgFirstFrostDoy: 270,
      frostFreeDays: 140,
      annualGdd50: 2200,
      avgChillHours: 1400,
      usdaZone: '5'
    },
    viableCrops: ['apple', 'maple_syrup', 'blueberry']
  },

  // === SOUTH CAROLINA ===
  south_carolina_ridge: {
    id: 'south_carolina_ridge',
    name: 'South Carolina Peach Ridge',
    displayName: 'SC Peach Ridge',
    state: 'SC',
    latitude: 34.5,
    longitude: -82.0,
    climate: {
      avgLastFrostDoy: 85,
      avgFirstFrostDoy: 310,
      frostFreeDays: 225,
      annualGdd50: 3600,
      avgChillHours: 900,
      usdaZone: '7'
    },
    viableCrops: ['peach', 'nectarine']
  }
}

/**
 * Region coordinates for weather API calls
 */
export const REGION_COORDINATES: Record<string, { lat: number; lon: number }> = Object.fromEntries(
  Object.entries(US_GROWING_REGIONS).map(([id, region]) => [
    id,
    { lat: region.latitude, lon: region.longitude }
  ])
)

/**
 * Get region by ID
 */
export function getRegion(regionId: string): GrowingRegion | undefined {
  return US_GROWING_REGIONS[regionId]
}

/**
 * Get all regions for a state
 */
export function getRegionsByState(state: string): GrowingRegion[] {
  return Object.values(US_GROWING_REGIONS).filter(r => r.state === state)
}
