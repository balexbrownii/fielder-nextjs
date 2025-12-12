/**
 * Master Product Catalog
 *
 * Hierarchical structure:
 *   Category → Subcategory → Product → Cultivar → Regional Offering → [Rootstock]
 *
 * Example:
 *   Fruit → Stone Fruit → Peach → Elberta → Elberta from Georgia → [on Lovell rootstock]
 *   Vegetable → Root → Sweet Potato → Murasaki → Murasaki from NC
 *
 * Cultivar Naming:
 *   - genericName: Technical/botanical cultivar name (e.g., "WA 38", "Cripps Pink")
 *   - displayName: Consumer-facing name, often trade name (e.g., "Cosmic Crisp", "Pink Lady")
 *   - tradeNames: Additional trade/marketing names
 *
 * Each cultivar can be grown in multiple regions with different:
 * - GDD accumulation patterns (weather-driven)
 * - Peak harvest windows
 * - Expected quality characteristics (terroir effects)
 */

export type ProductCategory = 'fruit' | 'vegetable' | 'nut' | 'meat' | 'dairy' | 'honey' | 'processed'

export type ProductSubcategory =
  // Fruits
  | 'citrus' | 'stone_fruit' | 'pome_fruit' | 'berry' | 'melon' | 'tropical'
  // Vegetables
  | 'leafy' | 'root' | 'nightshade' | 'squash' | 'cruciferous' | 'allium' | 'legume' | 'corn'
  // Nuts
  | 'tree_nut' | 'ground_nut'
  // Animal products
  | 'poultry' | 'red_meat' | 'game'
  | 'eggs' | 'milk'
  // Honey
  | 'raw_honey'
  // Processed
  | 'juice' | 'syrup' | 'oil' | 'cider'

export type ModelType = 'gdd' | 'calendar' | 'parent'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

/**
 * Product definition - the base type (e.g., "Apple", "Sweet Potato")
 * Sits within a category/subcategory hierarchy
 */
export interface Product {
  id: string
  name: string
  displayName: string
  category: ProductCategory
  subcategory: ProductSubcategory
  description?: string
}

/**
 * Cultivar definition - the specific genetic selection
 *
 * Examples:
 *   - Honeycrisp apple
 *   - Murasaki sweet potato (trade name: Stokes Purple)
 *   - WA 38 apple (trade name: Cosmic Crisp)
 *   - Brandywine tomato (heirloom)
 */
export interface Cultivar {
  id: string
  productId: string

  // Naming
  displayName: string       // Consumer-facing name (primary display name)
  technicalName?: string    // Technical/botanical name if different from displayName (e.g., "WA 38", "Cripps Pink")
  tradeNames?: string[]     // Additional trade/marketing names

  modelType: ModelType

  // Characteristics
  isHeritage?: boolean      // Traditional/heirloom variety (pre-1950s or open-pollinated)
  isNonGmo?: boolean        // Non-GMO verified
  flavorProfile?: string    // Tasting notes
  nutritionNotes?: string   // Key nutritional highlights

  // For GDD-based cultivars (baseline - can be overridden per region)
  baseTemp?: number         // Base temperature for GDD calculation (°F)
  gddToMaturity?: number    // GDD to start of harvest window
  gddToPeak?: number        // GDD to peak quality
  gddWindow?: number        // Duration of harvest window in GDD

  // For calendar-based products (meat, honey)
  peakMonths?: number[]     // Month numbers (1-12) for peak availability
  peakSeasons?: Season[]

  // For processed products
  parentCultivarId?: string // Source cultivar for processing timing
  parentVarietyId?: string  // Alias for parentCultivarId (backwards compat)

  description?: string
}

// Alias for backwards compatibility and clarity
export type Variety = Cultivar

/**
 * Region-specific offering (e.g., "Honeycrisp Apple from Washington")
 * This is the actual "product" consumers interact with
 *
 * Same cultivar in different regions produces different results due to:
 * - Climate (GDD accumulation rate)
 * - Terroir (soil, elevation, microclimate)
 * - Growing practices
 */
export interface RegionalOffering {
  id: string                // Unique: `${cultivarId}_${regionId}`
  cultivarId?: string       // References Cultivar.id (preferred)
  varietyId?: string        // Alias for cultivarId (backwards compat)
  regionId: string          // References US_GROWING_REGIONS

  // Region-specific GDD overrides (microclimates, elevation, etc.)
  gddToMaturityOverride?: number
  gddToPeakOverride?: number
  gddWindowOverride?: number
  baseTempOverride?: number

  // Region-specific calendar overrides
  peakMonthsOverride?: number[]

  // Expected quality for this region (terroir effect)
  qualityTier?: 'exceptional' | 'excellent' | 'good'
  flavorNotes?: string      // Region-specific tasting notes (e.g., "Texas soil adds sweetness")

  // Availability tracking
  isActive: boolean         // Currently being tracked in system
  availableFrom?: string    // Typical season start (month name)
  availableTo?: string      // Typical season end (month name)
}

// Backwards compatibility alias
export type { RegionalOffering as Offering }

/**
 * Rootstock (ONLY for tree crops - fruit trees, nut trees)
 *
 * NOT applicable to:
 * - Row crops (tomatoes, peppers, squash)
 * - Root vegetables (carrots, potatoes, beets)
 * - Berries (strawberries, blueberries - mostly own-root)
 * - Leafy greens
 * - Animal products
 *
 * Applicable to:
 * - Citrus (oranges, grapefruit, lemons)
 * - Pome fruit (apples, pears)
 * - Stone fruit (peaches, cherries, plums)
 * - Tree nuts (pecans, walnuts, almonds)
 * - Grapes (wine and table)
 */
export interface Rootstock {
  id: string
  name: string
  displayName: string

  // Which products this rootstock is used for
  compatibleProducts: string[]  // Product IDs (e.g., ['apple', 'pear'])

  // Effects on harvest
  vigor: 'dwarf' | 'semi-dwarf' | 'standard'
  harvestDaysOffset: number     // +/- days relative to standard timing

  // Effects on fruit quality
  fruitSizeEffect?: 'smaller' | 'standard' | 'larger'
  brixModifier?: number         // +/- Brix points

  // Characteristics
  diseaseResistance?: string[]  // e.g., ['fire_blight', 'collar_rot']
  coldHardiness?: 'low' | 'medium' | 'high'

  notes?: string
}

// Products that can have rootstocks (tree crops only)
export const GRAFTED_PRODUCT_CATEGORIES: ProductSubcategory[] = [
  'citrus',
  'stone_fruit',
  'pome_fruit',
  'tree_nut',
  // Note: 'berry' includes grapes which ARE grafted, but also strawberries which are NOT
  // Handle grape separately
]

export function isGraftedProduct(subcategory: ProductSubcategory, productId?: string): boolean {
  if (GRAFTED_PRODUCT_CATEGORIES.includes(subcategory)) return true
  // Grapes are grafted but in 'berry' subcategory
  if (productId === 'grape' || productId === 'wine_grape') return true
  return false
}

// =============================================================================
// PRODUCTS (Base level)
// =============================================================================

export const PRODUCTS: Product[] = [
  // === CITRUS ===
  { id: 'orange', name: 'orange', displayName: 'Orange', category: 'fruit', subcategory: 'citrus', description: 'Sweet citrus fruit' },
  { id: 'grapefruit', name: 'grapefruit', displayName: 'Grapefruit', category: 'fruit', subcategory: 'citrus', description: 'Tangy breakfast citrus' },
  { id: 'tangerine', name: 'tangerine', displayName: 'Tangerine', category: 'fruit', subcategory: 'citrus', description: 'Easy-peel mandarin family' },
  { id: 'lemon', name: 'lemon', displayName: 'Lemon', category: 'fruit', subcategory: 'citrus', description: 'Versatile cooking citrus' },
  { id: 'lime', name: 'lime', displayName: 'Lime', category: 'fruit', subcategory: 'citrus', description: 'Tart tropical citrus' },

  // === STONE FRUIT ===
  { id: 'peach', name: 'peach', displayName: 'Peach', category: 'fruit', subcategory: 'stone_fruit', description: 'Summer stone fruit' },
  { id: 'nectarine', name: 'nectarine', displayName: 'Nectarine', category: 'fruit', subcategory: 'stone_fruit', description: 'Smooth-skinned peach cousin' },
  { id: 'plum', name: 'plum', displayName: 'Plum', category: 'fruit', subcategory: 'stone_fruit', description: 'Sweet and tangy drupes' },
  { id: 'apricot', name: 'apricot', displayName: 'Apricot', category: 'fruit', subcategory: 'stone_fruit', description: 'Early summer stone fruit' },
  { id: 'cherry', name: 'cherry', displayName: 'Cherry', category: 'fruit', subcategory: 'stone_fruit', description: 'Sweet and tart varieties' },

  // === POME FRUIT ===
  { id: 'apple', name: 'apple', displayName: 'Apple', category: 'fruit', subcategory: 'pome_fruit', description: 'Americas favorite fruit' },
  { id: 'pear', name: 'pear', displayName: 'Pear', category: 'fruit', subcategory: 'pome_fruit', description: 'Buttery tree fruit' },
  { id: 'persimmon', name: 'persimmon', displayName: 'Persimmon', category: 'fruit', subcategory: 'pome_fruit', description: 'Sweet fall fruit' },

  // === BERRIES ===
  { id: 'strawberry', name: 'strawberry', displayName: 'Strawberry', category: 'fruit', subcategory: 'berry', description: 'Spring-summer favorite' },
  { id: 'blueberry', name: 'blueberry', displayName: 'Blueberry', category: 'fruit', subcategory: 'berry', description: 'Antioxidant-rich berry' },
  { id: 'raspberry', name: 'raspberry', displayName: 'Raspberry', category: 'fruit', subcategory: 'berry', description: 'Delicate bramble fruit' },
  { id: 'blackberry', name: 'blackberry', displayName: 'Blackberry', category: 'fruit', subcategory: 'berry', description: 'Wild bramble fruit' },
  { id: 'grape', name: 'grape', displayName: 'Grape', category: 'fruit', subcategory: 'berry', description: 'Table and wine varieties' },
  { id: 'cranberry', name: 'cranberry', displayName: 'Cranberry', category: 'fruit', subcategory: 'berry', description: 'Tart bog berry' },

  // === MELONS ===
  { id: 'watermelon', name: 'watermelon', displayName: 'Watermelon', category: 'fruit', subcategory: 'melon', description: 'Summer picnic staple' },
  { id: 'cantaloupe', name: 'cantaloupe', displayName: 'Cantaloupe', category: 'fruit', subcategory: 'melon', description: 'Sweet muskmelon' },
  { id: 'honeydew', name: 'honeydew', displayName: 'Honeydew', category: 'fruit', subcategory: 'melon', description: 'Mild green melon' },

  // === TROPICAL ===
  { id: 'avocado', name: 'avocado', displayName: 'Avocado', category: 'fruit', subcategory: 'tropical', description: 'Creamy fruit-vegetable' },
  { id: 'mango', name: 'mango', displayName: 'Mango', category: 'fruit', subcategory: 'tropical', description: 'King of tropical fruits' },
  { id: 'fig', name: 'fig', displayName: 'Fig', category: 'fruit', subcategory: 'tropical', description: 'Ancient sweet fruit' },
  { id: 'pomegranate', name: 'pomegranate', displayName: 'Pomegranate', category: 'fruit', subcategory: 'tropical', description: 'Jewel-seeded fruit' },

  // === LEAFY GREENS ===
  { id: 'lettuce', name: 'lettuce', displayName: 'Lettuce', category: 'vegetable', subcategory: 'leafy', description: 'Salad foundation' },
  { id: 'spinach', name: 'spinach', displayName: 'Spinach', category: 'vegetable', subcategory: 'leafy', description: 'Nutrient-dense green' },
  { id: 'kale', name: 'kale', displayName: 'Kale', category: 'vegetable', subcategory: 'leafy', description: 'Cold-hardy superfood' },
  { id: 'arugula', name: 'arugula', displayName: 'Arugula', category: 'vegetable', subcategory: 'leafy', description: 'Peppery salad green' },
  { id: 'chard', name: 'chard', displayName: 'Swiss Chard', category: 'vegetable', subcategory: 'leafy', description: 'Colorful cooking green' },
  { id: 'collards', name: 'collards', displayName: 'Collard Greens', category: 'vegetable', subcategory: 'leafy', description: 'Southern staple' },

  // === ROOT VEGETABLES ===
  { id: 'carrot', name: 'carrot', displayName: 'Carrot', category: 'vegetable', subcategory: 'root', description: 'Sweet orange root' },
  { id: 'potato', name: 'potato', displayName: 'Potato', category: 'vegetable', subcategory: 'root', description: 'Versatile tuber' },
  { id: 'sweet_potato', name: 'sweet_potato', displayName: 'Sweet Potato', category: 'vegetable', subcategory: 'root', description: 'Nutritious orange tuber' },
  { id: 'beet', name: 'beet', displayName: 'Beet', category: 'vegetable', subcategory: 'root', description: 'Earthy root vegetable' },
  { id: 'radish', name: 'radish', displayName: 'Radish', category: 'vegetable', subcategory: 'root', description: 'Quick-growing root' },
  { id: 'turnip', name: 'turnip', displayName: 'Turnip', category: 'vegetable', subcategory: 'root', description: 'Cool-weather root' },

  // === NIGHTSHADES ===
  { id: 'tomato', name: 'tomato', displayName: 'Tomato', category: 'vegetable', subcategory: 'nightshade', description: 'Summer garden essential' },
  { id: 'pepper', name: 'pepper', displayName: 'Pepper', category: 'vegetable', subcategory: 'nightshade', description: 'Sweet and hot varieties' },
  { id: 'eggplant', name: 'eggplant', displayName: 'Eggplant', category: 'vegetable', subcategory: 'nightshade', description: 'Purple cooking vegetable' },

  // === SQUASH ===
  { id: 'zucchini', name: 'zucchini', displayName: 'Zucchini', category: 'vegetable', subcategory: 'squash', description: 'Summer squash' },
  { id: 'butternut', name: 'butternut', displayName: 'Butternut Squash', category: 'vegetable', subcategory: 'squash', description: 'Sweet winter squash' },
  { id: 'acorn', name: 'acorn', displayName: 'Acorn Squash', category: 'vegetable', subcategory: 'squash', description: 'Small winter squash' },
  { id: 'pumpkin', name: 'pumpkin', displayName: 'Pumpkin', category: 'vegetable', subcategory: 'squash', description: 'Fall icon' },

  // === CRUCIFEROUS ===
  { id: 'broccoli', name: 'broccoli', displayName: 'Broccoli', category: 'vegetable', subcategory: 'cruciferous', description: 'Nutrient powerhouse' },
  { id: 'cauliflower', name: 'cauliflower', displayName: 'Cauliflower', category: 'vegetable', subcategory: 'cruciferous', description: 'Versatile crucifer' },
  { id: 'cabbage', name: 'cabbage', displayName: 'Cabbage', category: 'vegetable', subcategory: 'cruciferous', description: 'Head vegetable' },
  { id: 'brussels_sprouts', name: 'brussels_sprouts', displayName: 'Brussels Sprouts', category: 'vegetable', subcategory: 'cruciferous', description: 'Mini cabbages' },

  // === ALLIUMS ===
  { id: 'onion', name: 'onion', displayName: 'Onion', category: 'vegetable', subcategory: 'allium', description: 'Cooking foundation' },
  { id: 'garlic', name: 'garlic', displayName: 'Garlic', category: 'vegetable', subcategory: 'allium', description: 'Flavor essential' },
  { id: 'leek', name: 'leek', displayName: 'Leek', category: 'vegetable', subcategory: 'allium', description: 'Mild onion cousin' },

  // === LEGUMES ===
  { id: 'green_bean', name: 'green_bean', displayName: 'Green Bean', category: 'vegetable', subcategory: 'legume', description: 'Snap bean' },
  { id: 'pea', name: 'pea', displayName: 'Pea', category: 'vegetable', subcategory: 'legume', description: 'Sweet garden pea' },

  // === TREE NUTS ===
  { id: 'pecan', name: 'pecan', displayName: 'Pecan', category: 'nut', subcategory: 'tree_nut', description: 'Southern nut' },
  { id: 'walnut', name: 'walnut', displayName: 'Walnut', category: 'nut', subcategory: 'tree_nut', description: 'Brain-shaped nut' },
  { id: 'almond', name: 'almond', displayName: 'Almond', category: 'nut', subcategory: 'tree_nut', description: 'California staple' },
  { id: 'hazelnut', name: 'hazelnut', displayName: 'Hazelnut', category: 'nut', subcategory: 'tree_nut', description: 'Oregon filbert' },
  { id: 'pistachio', name: 'pistachio', displayName: 'Pistachio', category: 'nut', subcategory: 'tree_nut', description: 'Green desert nut' },

  // === GROUND NUTS ===
  { id: 'peanut', name: 'peanut', displayName: 'Peanut', category: 'nut', subcategory: 'ground_nut', description: 'Southern groundnut' },

  // === MEAT ===
  { id: 'beef', name: 'beef', displayName: 'Beef', category: 'meat', subcategory: 'red_meat', description: 'Pasture-raised cattle' },
  { id: 'pork', name: 'pork', displayName: 'Pork', category: 'meat', subcategory: 'red_meat', description: 'Heritage breeds' },
  { id: 'lamb', name: 'lamb', displayName: 'Lamb', category: 'meat', subcategory: 'red_meat', description: 'Spring lamb' },
  { id: 'chicken', name: 'chicken', displayName: 'Chicken', category: 'meat', subcategory: 'poultry', description: 'Pasture-raised poultry' },
  { id: 'turkey', name: 'turkey', displayName: 'Turkey', category: 'meat', subcategory: 'poultry', description: 'Heritage turkey' },

  // === DAIRY/EGGS ===
  { id: 'eggs', name: 'eggs', displayName: 'Eggs', category: 'dairy', subcategory: 'eggs', description: 'Pasture-raised eggs' },
  { id: 'milk', name: 'milk', displayName: 'Milk', category: 'dairy', subcategory: 'milk', description: 'Grass-fed dairy' },
  { id: 'cheese', name: 'cheese', displayName: 'Cheese', category: 'dairy', subcategory: 'milk', description: 'Artisan cheese' },

  // === HONEY ===
  { id: 'honey', name: 'honey', displayName: 'Honey', category: 'honey', subcategory: 'raw_honey', description: 'Raw local honey' },

  // === PROCESSED ===
  { id: 'orange_juice', name: 'orange_juice', displayName: 'Orange Juice', category: 'processed', subcategory: 'juice', description: 'Fresh-squeezed OJ' },
  { id: 'apple_cider', name: 'apple_cider', displayName: 'Apple Cider', category: 'processed', subcategory: 'cider', description: 'Fresh pressed cider' },
  { id: 'maple_syrup', name: 'maple_syrup', displayName: 'Maple Syrup', category: 'processed', subcategory: 'syrup', description: 'Pure maple' },
  { id: 'olive_oil', name: 'olive_oil', displayName: 'Olive Oil', category: 'processed', subcategory: 'oil', description: 'Fresh EVOO' },
]

// =============================================================================
// CULTIVARS (specific genetic selections)
// =============================================================================

export const CULTIVARS: Cultivar[] = [
  // === ORANGE VARIETIES ===
  // Citrus uses calendar model - perennial crops with predictable harvest windows
  {
    id: 'navel_orange',
    productId: 'orange',
    displayName: 'Washington Navel',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Sweet, seedless, ideal for eating fresh',
    peakMonths: [11, 12, 1], // Nov-Jan
  },
  {
    id: 'cara_cara',
    productId: 'orange',
    displayName: 'Cara Cara',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Pink flesh, low acid, berry notes',
    peakMonths: [12, 1, 2], // Dec-Feb
  },
  {
    id: 'valencia_orange',
    productId: 'orange',
    displayName: 'Valencia',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Premier juicing orange, sweet-tart balance',
    peakMonths: [3, 4, 5, 6], // Mar-Jun
  },
  {
    id: 'blood_orange',
    productId: 'orange',
    displayName: 'Moro Blood Orange',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Deep red flesh, raspberry-citrus notes',
    peakMonths: [12, 1, 2, 3], // Dec-Mar
  },

  // === GRAPEFRUIT VARIETIES ===
  {
    id: 'ruby_red_grapefruit',
    productId: 'grapefruit',
    displayName: 'Ruby Red',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Sweet-tart, deep pink flesh',
    peakMonths: [11, 12, 1, 2, 3, 4, 5], // Nov-May
  },
  {
    id: 'rio_star_grapefruit',
    productId: 'grapefruit',
    displayName: 'Rio Star',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Very sweet, red flesh, Texas favorite',
    peakMonths: [11, 12, 1, 2, 3], // Nov-Mar
  },
  {
    id: 'marsh_grapefruit',
    productId: 'grapefruit',
    displayName: 'Marsh White',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Classic tart grapefruit, white flesh',
    peakMonths: [11, 12, 1, 2, 3, 4, 5], // Nov-May
  },

  // === TANGERINE/MANDARIN VARIETIES ===
  {
    id: 'satsuma',
    productId: 'tangerine',
    displayName: 'Owari Satsuma',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Very sweet, seedless, easy peel',
    peakMonths: [10, 11, 12], // Oct-Dec
  },
  {
    id: 'clementine',
    productId: 'tangerine',
    displayName: 'Clementine',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Sweet, seedless, perfect snack size',
    peakMonths: [11, 12, 1], // Nov-Jan
  },
  {
    id: 'honey_tangerine',
    productId: 'tangerine',
    displayName: 'Honey Tangerine (Murcott)',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Intensely sweet, rich flavor, some seeds',
    peakMonths: [1, 2, 3, 4], // Jan-Apr
  },

  // === LEMON VARIETIES ===
  // Lemons produce year-round in warm climates, peak winter
  {
    id: 'eureka_lemon',
    productId: 'lemon',
    displayName: 'Eureka',
    modelType: 'calendar',
    flavorProfile: 'Classic lemon, true sour, year-round',
    peakMonths: [11, 12, 1, 2, 3], // Nov-Mar peak, available year-round
  },
  {
    id: 'meyer_lemon',
    productId: 'lemon',
    displayName: 'Meyer Lemon',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Sweet-tart, floral, thin skin',
    peakMonths: [11, 12, 1, 2, 3], // Nov-Mar
  },

  // === APPLE VARIETIES ===
  // Apples - perennial tree fruit, calendar-based harvest
  {
    id: 'honeycrisp',
    productId: 'apple',
    displayName: 'Honeycrisp',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Explosive crunch, honey-sweet with tang',
    nutritionNotes: 'High in fiber and vitamin C',
    peakMonths: [9, 10], // September-October
  },
  {
    id: 'fuji',
    productId: 'apple',
    displayName: 'Fuji',
    modelType: 'calendar',
    flavorProfile: 'Very sweet, dense, long storage',
    peakMonths: [10, 11], // October-November
  },
  {
    id: 'gala',
    productId: 'apple',
    displayName: 'Gala',
    modelType: 'calendar',
    flavorProfile: 'Mild sweet, crisp, kids favorite',
    peakMonths: [8, 9], // August-September (early variety)
  },
  {
    id: 'granny_smith',
    productId: 'apple',
    displayName: 'Granny Smith',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Tart, firm, excellent for baking',
    peakMonths: [10, 11], // October-November
  },
  {
    id: 'pink_lady',
    productId: 'apple',
    displayName: 'Pink Lady (Cripps Pink)',
    modelType: 'calendar',
    flavorProfile: 'Sweet-tart balance, effervescent',
    peakMonths: [10, 11, 12], // October-December (late variety)
  },
  {
    id: 'arkansas_black',
    productId: 'apple',
    displayName: 'Arkansas Black',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Deep purple, complex, improves in storage',
    peakMonths: [10, 11], // October-November
  },
  {
    id: 'cosmic_crisp',
    productId: 'apple',
    displayName: 'Cosmic Crisp',
    modelType: 'calendar',
    isNonGmo: true,
    flavorProfile: 'Ultra crisp, balanced sweet-acid, slow browning',
    peakMonths: [10, 11], // October-November
  },

  // === PEACH VARIETIES ===
  // Peaches - perennial stone fruit, calendar-based harvest
  {
    id: 'elberta_peach',
    productId: 'peach',
    displayName: 'Elberta',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Classic peach flavor, freestone, great for canning',
    peakMonths: [7, 8], // July-August
  },
  {
    id: 'georgia_belle',
    productId: 'peach',
    displayName: 'Georgia Belle',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'White flesh, incredibly sweet and aromatic',
    peakMonths: [7, 8], // July-August
  },
  {
    id: 'redhaven',
    productId: 'peach',
    displayName: 'Redhaven',
    modelType: 'calendar',
    flavorProfile: 'Bright red skin, firm yellow flesh, balanced flavor',
    peakMonths: [6, 7], // June-July (early variety)
  },
  {
    id: 'white_lady',
    productId: 'peach',
    displayName: 'White Lady',
    modelType: 'calendar',
    flavorProfile: 'White flesh, sub-acid, intensely sweet',
    peakMonths: [7, 8], // July-August
  },

  // === CHERRY VARIETIES ===
  // Cherries - perennial stone fruit, calendar-based harvest
  {
    id: 'bing_cherry',
    productId: 'cherry',
    displayName: 'Bing',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Deep red, firm, intensely sweet',
    peakMonths: [6, 7], // June-July
  },
  {
    id: 'rainier_cherry',
    productId: 'cherry',
    displayName: 'Rainier',
    modelType: 'calendar',
    flavorProfile: 'Yellow-red blush, delicate, ultra-sweet',
    peakMonths: [6, 7], // June-July
  },
  {
    id: 'montmorency',
    productId: 'cherry',
    displayName: 'Montmorency',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Tart, bright red, perfect for pies',
    peakMonths: [7], // July
  },

  // === STRAWBERRY VARIETIES ===
  // Strawberries - calendar-based (varies by region)
  {
    id: 'chandler_strawberry',
    productId: 'strawberry',
    displayName: 'Chandler',
    modelType: 'calendar',
    flavorProfile: 'Large, very sweet, California classic',
    peakMonths: [3, 4, 5, 6], // March-June (CA); May-June elsewhere
  },
  {
    id: 'earliglow',
    productId: 'strawberry',
    displayName: 'Earliglow',
    modelType: 'calendar',
    flavorProfile: 'Exceptional flavor, early season',
    peakMonths: [5, 6], // May-June
  },
  {
    id: 'seascape',
    productId: 'strawberry',
    displayName: 'Seascape',
    modelType: 'calendar',
    flavorProfile: 'Day-neutral, complex flavor, long season',
    peakMonths: [5, 6, 7, 8, 9], // May-September (day-neutral, long season)
  },

  // === BLUEBERRY VARIETIES ===
  // Blueberries - perennial shrubs, calendar-based harvest
  {
    id: 'duke_blueberry',
    productId: 'blueberry',
    displayName: 'Duke',
    modelType: 'calendar',
    flavorProfile: 'Mild sweet, firm, early season',
    peakMonths: [6, 7], // June-July (early)
  },
  {
    id: 'bluecrop',
    productId: 'blueberry',
    displayName: 'Bluecrop',
    modelType: 'calendar',
    flavorProfile: 'Classic blueberry flavor, reliable producer',
    peakMonths: [7, 8], // July-August (mid-season)
  },
  {
    id: 'rabbiteye',
    productId: 'blueberry',
    displayName: 'Rabbiteye',
    modelType: 'calendar',
    flavorProfile: 'Heat-tolerant, sweet, southern variety',
    peakMonths: [6, 7, 8], // June-August (southern variety)
  },

  // === TOMATO VARIETIES ===
  {
    id: 'brandywine',
    productId: 'tomato',
    displayName: 'Brandywine',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Pink, rich, complex heirloom flavor',
    baseTemp: 50, gddToMaturity: 1600, gddToPeak: 1800, gddWindow: 400,
  },
  {
    id: 'cherokee_purple',
    productId: 'tomato',
    displayName: 'Cherokee Purple',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Deep purple, smoky-sweet, pre-Columbian origin',
    baseTemp: 50, gddToMaturity: 1500, gddToPeak: 1700, gddWindow: 400,
  },
  {
    id: 'san_marzano',
    productId: 'tomato',
    displayName: 'San Marzano',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Paste tomato, low acid, sweet, Italian classic',
    baseTemp: 50, gddToMaturity: 1400, gddToPeak: 1600, gddWindow: 350,
  },
  {
    id: 'sungold',
    productId: 'tomato',
    displayName: 'Sungold Cherry',
    modelType: 'gdd',
    flavorProfile: 'Orange cherry, intensely sweet, tropical notes',
    baseTemp: 50, gddToMaturity: 1200, gddToPeak: 1400, gddWindow: 400,
  },

  // === PEPPER VARIETIES ===
  {
    id: 'jimmy_nardello',
    productId: 'pepper',
    displayName: 'Jimmy Nardello',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Sweet frying pepper, Italian heirloom',
    baseTemp: 55, gddToMaturity: 1200, gddToPeak: 1400, gddWindow: 350,
  },
  {
    id: 'shishito',
    productId: 'pepper',
    displayName: 'Shishito',
    modelType: 'gdd',
    flavorProfile: 'Mild, blistering pepper, occasional heat',
    baseTemp: 55, gddToMaturity: 1100, gddToPeak: 1300, gddWindow: 400,
  },
  {
    id: 'hatch_chile',
    productId: 'pepper',
    displayName: 'Hatch Green Chile',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Medium heat, earthy, roasting chile',
    baseTemp: 55, gddToMaturity: 1300, gddToPeak: 1500, gddWindow: 350,
  },

  // === CARROT VARIETIES ===
  {
    id: 'nantes_carrot',
    productId: 'carrot',
    displayName: 'Nantes',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Sweet, tender, cylindrical',
    baseTemp: 40, gddToMaturity: 1100, gddToPeak: 1250, gddWindow: 300,
  },
  {
    id: 'purple_haze',
    productId: 'carrot',
    displayName: 'Purple Haze',
    modelType: 'gdd',
    flavorProfile: 'Purple exterior, orange core, sweet',
    nutritionNotes: 'High in anthocyanins',
    baseTemp: 40, gddToMaturity: 1150, gddToPeak: 1300, gddWindow: 300,
  },

  // === POTATO VARIETIES ===
  {
    id: 'yukon_gold',
    productId: 'potato',
    displayName: 'Yukon Gold',
    modelType: 'gdd',
    flavorProfile: 'Buttery, golden, all-purpose',
    baseTemp: 45, gddToMaturity: 1400, gddToPeak: 1600, gddWindow: 400,
  },
  {
    id: 'fingerling',
    productId: 'potato',
    displayName: 'Fingerling',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Nutty, firm, waxy texture',
    baseTemp: 45, gddToMaturity: 1500, gddToPeak: 1700, gddWindow: 400,
  },
  {
    id: 'purple_peruvian',
    productId: 'potato',
    displayName: 'Purple Peruvian',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Deep purple, earthy, antioxidant-rich',
    nutritionNotes: 'High in anthocyanins',
    baseTemp: 45, gddToMaturity: 1600, gddToPeak: 1800, gddWindow: 400,
  },

  // === ONION VARIETIES ===
  {
    id: 'vidalia_onion',
    productId: 'onion',
    displayName: 'Vidalia',
    modelType: 'gdd',
    flavorProfile: 'Exceptionally sweet, low sulfur',
    baseTemp: 40, gddToMaturity: 1400, gddToPeak: 1600, gddWindow: 350,
  },
  {
    id: 'walla_walla',
    productId: 'onion',
    displayName: 'Walla Walla',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Sweet, mild, Pacific Northwest treasure',
    baseTemp: 40, gddToMaturity: 1500, gddToPeak: 1700, gddWindow: 350,
  },

  // === GARLIC VARIETIES ===
  {
    id: 'music_garlic',
    productId: 'garlic',
    displayName: 'Music (Hardneck)',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Robust, complex, large cloves',
    baseTemp: 35, gddToMaturity: 1800, gddToPeak: 2000, gddWindow: 400,
  },
  {
    id: 'inchelium_red',
    productId: 'garlic',
    displayName: 'Inchelium Red (Softneck)',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Mild, creamy, excellent for roasting',
    baseTemp: 35, gddToMaturity: 1700, gddToPeak: 1900, gddWindow: 400,
  },

  // === MEAT VARIETIES ===
  {
    id: 'grass_fed_beef',
    productId: 'beef',
    displayName: 'Grass-Fed Beef',
    modelType: 'calendar',
    flavorProfile: 'Lean, rich, true beef flavor',
    nutritionNotes: 'Higher omega-3s than grain-fed',
    peakMonths: [9, 10, 11],
    peakSeasons: ['fall'],
  },
  {
    id: 'heritage_pork',
    productId: 'pork',
    displayName: 'Heritage Pork',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Berkshire/Duroc, marbled, exceptional flavor',
    peakMonths: [10, 11, 12],
    peakSeasons: ['fall', 'winter'],
  },
  {
    id: 'spring_lamb',
    productId: 'lamb',
    displayName: 'Spring Lamb',
    modelType: 'calendar',
    flavorProfile: 'Tender, mild, milk-fed',
    peakMonths: [4, 5, 6],
    peakSeasons: ['spring'],
  },
  {
    id: 'pasture_chicken',
    productId: 'chicken',
    displayName: 'Pasture-Raised Chicken',
    modelType: 'calendar',
    flavorProfile: 'Rich, firm texture, true chicken flavor',
    peakMonths: [5, 6, 7, 8, 9, 10],
    peakSeasons: ['summer', 'fall'],
  },
  {
    id: 'heritage_turkey',
    productId: 'turkey',
    displayName: 'Heritage Turkey',
    modelType: 'calendar',
    isHeritage: true,
    flavorProfile: 'Bourbon Red/Narragansett, deep flavor',
    peakMonths: [10, 11],
    peakSeasons: ['fall'],
  },

  // === DAIRY/EGGS ===
  {
    id: 'pasture_eggs',
    productId: 'eggs',
    displayName: 'Pasture-Raised Eggs',
    modelType: 'calendar',
    flavorProfile: 'Deep orange yolks, rich flavor',
    nutritionNotes: '2x omega-3s, 3x vitamin E vs conventional',
    peakMonths: [3, 4, 5, 6, 7, 8, 9],
    peakSeasons: ['spring', 'summer', 'fall'],
  },
  {
    id: 'grass_milk',
    productId: 'milk',
    displayName: '100% Grass-Fed Milk',
    modelType: 'calendar',
    flavorProfile: 'Rich, seasonal variation in flavor',
    nutritionNotes: 'Higher CLA and omega-3s during grazing',
    peakMonths: [4, 5, 6, 7, 8, 9, 10],
    peakSeasons: ['spring', 'summer', 'fall'],
  },

  // === HONEY ===
  {
    id: 'wildflower_honey',
    productId: 'honey',
    displayName: 'Wildflower Honey',
    modelType: 'calendar',
    flavorProfile: 'Complex, varies by region and season',
    peakMonths: [5, 6, 7, 8, 9],
    peakSeasons: ['spring', 'summer'],
  },
  {
    id: 'tupelo_honey',
    productId: 'honey',
    displayName: 'Tupelo Honey',
    modelType: 'calendar',
    flavorProfile: 'Buttery, mild, never crystallizes',
    peakMonths: [4, 5],
    peakSeasons: ['spring'],
  },
  {
    id: 'sourwood_honey',
    productId: 'honey',
    displayName: 'Sourwood Honey',
    modelType: 'calendar',
    flavorProfile: 'Buttery, gingerbread notes, Appalachian',
    peakMonths: [7, 8],
    peakSeasons: ['summer'],
  },

  // === TREE NUTS ===
  {
    id: 'pecan',
    productId: 'pecan',
    displayName: 'Desirable Pecan',
    modelType: 'gdd',
    flavorProfile: 'Rich, buttery, classic pecan flavor',
    baseTemp: 50, gddToMaturity: 2800, gddToPeak: 3200, gddWindow: 600,
  },
  {
    id: 'walnut',
    productId: 'walnut',
    displayName: 'Chandler Walnut',
    modelType: 'gdd',
    flavorProfile: 'Mild, versatile, light-colored',
    baseTemp: 50, gddToMaturity: 2600, gddToPeak: 3000, gddWindow: 500,
  },
  {
    id: 'almond',
    productId: 'almond',
    displayName: 'Nonpareil Almond',
    modelType: 'gdd',
    flavorProfile: 'Sweet, delicate, paper-thin shell',
    baseTemp: 50, gddToMaturity: 2400, gddToPeak: 2800, gddWindow: 400,
  },
  {
    id: 'hazelnut',
    productId: 'hazelnut',
    displayName: 'Barcelona Hazelnut',
    modelType: 'gdd',
    isHeritage: true,
    flavorProfile: 'Intense flavor, Oregon classic',
    baseTemp: 45, gddToMaturity: 2200, gddToPeak: 2600, gddWindow: 500,
  },
  {
    id: 'pistachio',
    productId: 'pistachio',
    displayName: 'Kerman Pistachio',
    modelType: 'gdd',
    flavorProfile: 'Rich, green, California grown',
    baseTemp: 55, gddToMaturity: 3200, gddToPeak: 3600, gddWindow: 500,
  },

  // === PROCESSED ===
  {
    id: 'fresh_squeezed_oj',
    productId: 'orange_juice',
    displayName: 'Fresh-Squeezed Orange Juice',
    modelType: 'parent',
    parentVarietyId: 'valencia_orange',
    flavorProfile: 'Bright, fresh, unpasteurized',
  },
  {
    id: 'fresh_cider',
    productId: 'apple_cider',
    displayName: 'Fresh Apple Cider',
    modelType: 'parent',
    parentVarietyId: 'honeycrisp',
    flavorProfile: 'Unfiltered, fresh-pressed, complex apple',
  },
  {
    id: 'grade_a_maple',
    productId: 'maple_syrup',
    displayName: 'Grade A Amber Maple Syrup',
    modelType: 'calendar',
    flavorProfile: 'Rich maple flavor, mid-season run',
    peakMonths: [2, 3, 4],
    peakSeasons: ['winter', 'spring'],
  },
  {
    id: 'fresh_evoo',
    productId: 'olive_oil',
    displayName: 'Fresh EVOO (Olio Nuovo)',
    modelType: 'parent',
    parentVarietyId: 'olive',
    flavorProfile: 'Peppery, grassy, unfiltered first press',
  },
]

// =============================================================================
// REGIONAL OFFERINGS (Variety × Region combinations)
// =============================================================================

export const REGIONAL_OFFERINGS: RegionalOffering[] = [
  // === CITRUS - Florida ===
  { id: 'navel_orange_indian_river', varietyId: 'navel_orange', regionId: 'indian_river', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Sweet, optimal Brix from Indian River soil' },
  { id: 'navel_orange_central_florida', varietyId: 'navel_orange', regionId: 'central_florida', isActive: true, qualityTier: 'excellent' },
  { id: 'valencia_orange_indian_river', varietyId: 'valencia_orange', regionId: 'indian_river', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Premium juice orange' },
  { id: 'valencia_orange_central_florida', varietyId: 'valencia_orange', regionId: 'central_florida', isActive: true, qualityTier: 'excellent' },
  { id: 'ruby_red_grapefruit_indian_river', varietyId: 'ruby_red_grapefruit', regionId: 'indian_river', isActive: true, qualityTier: 'exceptional' },
  { id: 'satsuma_gulf_coast', varietyId: 'satsuma', regionId: 'gulf_coast_citrus', isActive: true, qualityTier: 'excellent', flavorNotes: 'Cold-hardy, early season' },
  { id: 'honey_tangerine_central_florida', varietyId: 'honey_tangerine', regionId: 'central_florida', isActive: true, qualityTier: 'exceptional' },

  // === CITRUS - Texas ===
  { id: 'rio_star_grapefruit_rio_grande', varietyId: 'rio_star_grapefruit', regionId: 'texas_rgv', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Texas terroir, extra sweet' },
  { id: 'ruby_red_grapefruit_rio_grande', varietyId: 'ruby_red_grapefruit', regionId: 'texas_rgv', isActive: true, qualityTier: 'excellent' },

  // === CITRUS - California ===
  { id: 'navel_orange_central_valley_south', varietyId: 'navel_orange', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'cara_cara_central_valley_south', varietyId: 'cara_cara', regionId: 'california_central_valley', isActive: true, qualityTier: 'exceptional' },
  { id: 'blood_orange_central_valley_south', varietyId: 'blood_orange', regionId: 'california_central_valley', isActive: true, qualityTier: 'exceptional' },
  { id: 'eureka_lemon_ventura', varietyId: 'eureka_lemon', regionId: 'california_coastal', isActive: true, qualityTier: 'exceptional' },
  { id: 'meyer_lemon_central_valley_south', varietyId: 'meyer_lemon', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },

  // === APPLES - Washington ===
  { id: 'honeycrisp_pacific_northwest', varietyId: 'honeycrisp', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Cool nights enhance sweetness and crunch' },
  { id: 'fuji_pacific_northwest', varietyId: 'fuji', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },
  { id: 'gala_pacific_northwest', varietyId: 'gala', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },
  { id: 'cosmic_crisp_pacific_northwest', varietyId: 'cosmic_crisp', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Washington-bred variety' },

  // === APPLES - Northeast ===
  { id: 'honeycrisp_finger_lakes', varietyId: 'honeycrisp', regionId: 'new_york_finger_lakes', isActive: true, qualityTier: 'excellent', flavorNotes: 'Shorter season, intense flavor' },
  { id: 'honeycrisp_new_england', varietyId: 'honeycrisp', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },
  { id: 'granny_smith_new_england', varietyId: 'granny_smith', regionId: 'new_england', isActive: true, qualityTier: 'good' },

  // === APPLES - Michigan ===
  { id: 'honeycrisp_great_lakes', varietyId: 'honeycrisp', regionId: 'michigan_west', isActive: true, qualityTier: 'excellent' },
  { id: 'fuji_great_lakes', varietyId: 'fuji', regionId: 'michigan_west', isActive: true, qualityTier: 'excellent' },

  // === PEACHES - Georgia ===
  { id: 'elberta_georgia_piedmont', varietyId: 'elberta_peach', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Georgia terroir, classic Southern peach' },
  { id: 'georgia_belle_georgia_piedmont', varietyId: 'georgia_belle', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'exceptional' },
  { id: 'redhaven_georgia_piedmont', varietyId: 'redhaven', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },

  // === PEACHES - South Carolina ===
  { id: 'elberta_south_carolina', varietyId: 'elberta_peach', regionId: 'south_carolina_ridge', isActive: true, qualityTier: 'excellent' },
  { id: 'white_lady_south_carolina', varietyId: 'white_lady', regionId: 'south_carolina_ridge', isActive: true, qualityTier: 'exceptional' },

  // === PEACHES - California ===
  { id: 'elberta_central_valley_north', varietyId: 'elberta_peach', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent', gddToMaturityOverride: 2300 },
  { id: 'redhaven_central_valley_north', varietyId: 'redhaven', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },

  // === CHERRIES - Washington/Oregon ===
  { id: 'bing_pacific_northwest', varietyId: 'bing_cherry', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'exceptional' },
  { id: 'rainier_pacific_northwest', varietyId: 'rainier_cherry', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Premium, handle with care' },
  { id: 'bing_willamette', varietyId: 'bing_cherry', regionId: 'pacific_nw_hood_river', isActive: true, qualityTier: 'excellent' },

  // === CHERRIES - Michigan ===
  { id: 'montmorency_great_lakes', varietyId: 'montmorency', regionId: 'michigan_west', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Tart cherry capital of the world' },
  { id: 'bing_great_lakes', varietyId: 'bing_cherry', regionId: 'michigan_west', isActive: true, qualityTier: 'excellent' },

  // === STRAWBERRIES ===
  { id: 'chandler_central_valley_south', varietyId: 'chandler_strawberry', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'chandler_ventura', varietyId: 'chandler_strawberry', regionId: 'california_coastal', isActive: true, qualityTier: 'exceptional' },
  { id: 'seascape_ventura', varietyId: 'seascape', regionId: 'california_coastal', isActive: true, qualityTier: 'excellent' },
  { id: 'earliglow_new_england', varietyId: 'earliglow', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },
  { id: 'chandler_central_florida', varietyId: 'chandler_strawberry', regionId: 'central_florida', isActive: true, qualityTier: 'excellent', flavorNotes: 'Winter strawberries' },

  // === BLUEBERRIES ===
  { id: 'duke_pacific_northwest', varietyId: 'duke_blueberry', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },
  { id: 'bluecrop_great_lakes', varietyId: 'bluecrop', regionId: 'michigan_west', isActive: true, qualityTier: 'exceptional' },
  { id: 'bluecrop_new_england', varietyId: 'bluecrop', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },
  { id: 'rabbiteye_georgia_piedmont', varietyId: 'rabbiteye', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },

  // === TOMATOES ===
  { id: 'brandywine_georgia_piedmont', varietyId: 'brandywine', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'exceptional' },
  { id: 'brandywine_central_valley_south', varietyId: 'brandywine', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'cherokee_purple_georgia_piedmont', varietyId: 'cherokee_purple', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Cherokee heritage, Southern terroir' },
  { id: 'san_marzano_central_valley_south', varietyId: 'san_marzano', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'sungold_central_valley_south', varietyId: 'sungold', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'sungold_new_england', varietyId: 'sungold', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },

  // === PEPPERS ===
  { id: 'jimmy_nardello_central_valley_south', varietyId: 'jimmy_nardello', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'hatch_chile_rio_grande', varietyId: 'hatch_chile', regionId: 'texas_rgv', isActive: true, qualityTier: 'exceptional', flavorNotes: 'True Hatch, NM terroir' },
  { id: 'shishito_central_valley_south', varietyId: 'shishito', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },

  // === ROOT VEGETABLES ===
  { id: 'nantes_carrot_central_valley_south', varietyId: 'nantes_carrot', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'nantes_carrot_willamette', varietyId: 'nantes_carrot', regionId: 'pacific_nw_hood_river', isActive: true, qualityTier: 'excellent' },
  { id: 'yukon_gold_pacific_northwest', varietyId: 'yukon_gold', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },
  { id: 'fingerling_finger_lakes', varietyId: 'fingerling', regionId: 'new_york_finger_lakes', isActive: true, qualityTier: 'excellent' },

  // === ONIONS ===
  { id: 'vidalia_georgia_piedmont', varietyId: 'vidalia_onion', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'exceptional', flavorNotes: 'True Vidalia, Georgia terroir required' },
  { id: 'walla_walla_pacific_northwest', varietyId: 'walla_walla', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'exceptional' },

  // === GARLIC ===
  { id: 'music_garlic_finger_lakes', varietyId: 'music_garlic', regionId: 'new_york_finger_lakes', isActive: true, qualityTier: 'excellent' },
  { id: 'music_garlic_willamette', varietyId: 'music_garlic', regionId: 'pacific_nw_hood_river', isActive: true, qualityTier: 'excellent' },
  { id: 'inchelium_red_pacific_northwest', varietyId: 'inchelium_red', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'exceptional' },

  // === NUTS ===
  { id: 'pecan_georgia_piedmont', varietyId: 'pecan', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },
  { id: 'pecan_hill_country', varietyId: 'pecan', regionId: 'texas_hill_country', isActive: true, qualityTier: 'excellent' },
  { id: 'walnut_central_valley_north', varietyId: 'walnut', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
  { id: 'almond_central_valley_south', varietyId: 'almond', regionId: 'california_central_valley', isActive: true, qualityTier: 'exceptional' },
  { id: 'hazelnut_willamette', varietyId: 'hazelnut', regionId: 'pacific_nw_hood_river', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Oregon filberts, world-class' },
  { id: 'pistachio_central_valley_south', varietyId: 'pistachio', regionId: 'california_central_valley', isActive: true, qualityTier: 'exceptional' },

  // === MEAT ===
  { id: 'grass_fed_beef_hill_country', varietyId: 'grass_fed_beef', regionId: 'texas_hill_country', isActive: true, qualityTier: 'excellent' },
  { id: 'grass_fed_beef_pacific_northwest', varietyId: 'grass_fed_beef', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },
  { id: 'heritage_pork_georgia_piedmont', varietyId: 'heritage_pork', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },
  { id: 'heritage_pork_new_england', varietyId: 'heritage_pork', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },
  { id: 'spring_lamb_hill_country', varietyId: 'spring_lamb', regionId: 'texas_hill_country', isActive: true, qualityTier: 'excellent' },
  { id: 'pasture_chicken_georgia_piedmont', varietyId: 'pasture_chicken', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },
  { id: 'heritage_turkey_new_england', varietyId: 'heritage_turkey', regionId: 'new_england', isActive: true, qualityTier: 'exceptional' },

  // === DAIRY/EGGS ===
  { id: 'pasture_eggs_georgia_piedmont', varietyId: 'pasture_eggs', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },
  { id: 'pasture_eggs_pacific_northwest', varietyId: 'pasture_eggs', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },
  { id: 'grass_milk_new_england', varietyId: 'grass_milk', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },
  { id: 'grass_milk_pacific_northwest', varietyId: 'grass_milk', regionId: 'pacific_nw_yakima', isActive: true, qualityTier: 'excellent' },

  // === HONEY ===
  { id: 'wildflower_honey_georgia_piedmont', varietyId: 'wildflower_honey', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'excellent' },
  { id: 'tupelo_honey_gulf_coast', varietyId: 'tupelo_honey', regionId: 'gulf_coast_citrus', isActive: true, qualityTier: 'exceptional', flavorNotes: 'Rare, only from Gulf Coast swamps' },
  { id: 'sourwood_honey_georgia_piedmont', varietyId: 'sourwood_honey', regionId: 'georgia_piedmont', isActive: true, qualityTier: 'exceptional' },

  // === PROCESSED ===
  { id: 'fresh_oj_indian_river', varietyId: 'fresh_squeezed_oj', regionId: 'indian_river', isActive: true, qualityTier: 'exceptional' },
  { id: 'fresh_cider_new_england', varietyId: 'fresh_cider', regionId: 'new_england', isActive: true, qualityTier: 'excellent' },
  { id: 'fresh_cider_finger_lakes', varietyId: 'fresh_cider', regionId: 'new_york_finger_lakes', isActive: true, qualityTier: 'excellent' },
  { id: 'maple_syrup_new_england', varietyId: 'grade_a_maple', regionId: 'new_england', isActive: true, qualityTier: 'exceptional' },
  { id: 'maple_syrup_finger_lakes', varietyId: 'grade_a_maple', regionId: 'new_york_finger_lakes', isActive: true, qualityTier: 'excellent' },
  { id: 'evoo_central_valley_south', varietyId: 'fresh_evoo', regionId: 'california_central_valley', isActive: true, qualityTier: 'excellent' },
]

// =============================================================================
// LOOKUP HELPERS
// =============================================================================

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map(p => [p.id, p])
)

export const CULTIVARS_BY_ID: Record<string, Cultivar> = Object.fromEntries(
  CULTIVARS.map(c => [c.id, c])
)

// Backwards compatibility alias
export const VARIETIES_BY_ID = CULTIVARS_BY_ID

export const OFFERINGS_BY_ID: Record<string, RegionalOffering> = Object.fromEntries(
  REGIONAL_OFFERINGS.map(o => [o.id, o])
)

export const CULTIVARS_BY_PRODUCT: Record<string, Cultivar[]> = CULTIVARS.reduce((acc, c) => {
  if (!acc[c.productId]) acc[c.productId] = []
  acc[c.productId].push(c)
  return acc
}, {} as Record<string, Cultivar[]>)

// Backwards compatibility alias
export const VARIETIES_BY_PRODUCT = CULTIVARS_BY_PRODUCT

// Note: REGIONAL_OFFERINGS uses `varietyId` field for backwards compatibility
// but conceptually this is the cultivarId
export const OFFERINGS_BY_CULTIVAR: Record<string, RegionalOffering[]> = REGIONAL_OFFERINGS.reduce((acc, o) => {
  // Use varietyId for now (backwards compat) - treat as cultivarId
  const cultivarId = (o as { varietyId?: string; cultivarId?: string }).varietyId || o.cultivarId
  if (!cultivarId) return acc
  if (!acc[cultivarId]) acc[cultivarId] = []
  acc[cultivarId].push(o)
  return acc
}, {} as Record<string, RegionalOffering[]>)

// Backwards compatibility alias
export const OFFERINGS_BY_VARIETY = OFFERINGS_BY_CULTIVAR

export const OFFERINGS_BY_REGION: Record<string, RegionalOffering[]> = REGIONAL_OFFERINGS.reduce((acc, o) => {
  if (!acc[o.regionId]) acc[o.regionId] = []
  acc[o.regionId].push(o)
  return acc
}, {} as Record<string, RegionalOffering[]>)

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get complete offering info with product, variety, and region data merged
 */
export function getOfferingDetails(offeringId: string) {
  const offering = OFFERINGS_BY_ID[offeringId]
  if (!offering) return null

  // Support both varietyId (legacy) and cultivarId
  const cultivarId = offering.varietyId || offering.cultivarId
  if (!cultivarId) return null

  const variety = VARIETIES_BY_ID[cultivarId]
  if (!variety) return null

  const product = PRODUCTS_BY_ID[variety.productId]
  if (!product) return null

  return {
    ...offering,
    variety,
    product,
    // Merge GDD values (offering overrides > variety defaults)
    gddToMaturity: offering.gddToMaturityOverride ?? variety.gddToMaturity,
    gddToPeak: offering.gddToPeakOverride ?? variety.gddToPeak,
    gddWindow: offering.gddWindowOverride ?? variety.gddWindow,
    baseTemp: offering.baseTempOverride ?? variety.baseTemp,
    // For calendar-based
    peakMonths: offering.peakMonthsOverride ?? variety.peakMonths,
  }
}

/**
 * Get all active offerings for a region
 */
export function getActiveOfferingsForRegion(regionId: string): RegionalOffering[] {
  return (OFFERINGS_BY_REGION[regionId] || []).filter(o => o.isActive)
}

/**
 * Get all offerings for a product (all varieties, all regions)
 */
export function getOfferingsForProduct(productId: string): RegionalOffering[] {
  const varieties = VARIETIES_BY_PRODUCT[productId] || []
  return varieties.flatMap(v => OFFERINGS_BY_VARIETY[v.id] || [])
}

// Category display names
export const CATEGORY_DISPLAY_NAMES: Record<ProductCategory, string> = {
  fruit: 'Fruits',
  vegetable: 'Vegetables',
  nut: 'Nuts',
  meat: 'Meat & Poultry',
  dairy: 'Dairy & Eggs',
  honey: 'Honey',
  processed: 'Lightly Processed',
}

// Counts
export const TOTAL_PRODUCTS = PRODUCTS.length
export const TOTAL_CULTIVARS = CULTIVARS.length
export const TOTAL_VARIETIES = TOTAL_CULTIVARS // Backwards compat alias
export const TOTAL_OFFERINGS = REGIONAL_OFFERINGS.length
