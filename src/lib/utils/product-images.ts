/**
 * Shared product image utility
 * Uses deterministic hashing so the same region+variety always shows the same image
 */

// Multiple high-quality images per product type for visual variety
export const PRODUCT_IMAGE_POOLS: Record<string, string[]> = {
  orange: [
    // Verified Pexels orange images
    'https://images.pexels.com/photos/1937743/pexels-photo-1937743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1002778/pexels-photo-1002778.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/2683373/pexels-photo-2683373.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=600&fit=crop&q=80',
  ],
  navel_orange: [
    // Verified Pexels orange images
    'https://images.pexels.com/photos/1937743/pexels-photo-1937743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1002778/pexels-photo-1002778.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/2683373/pexels-photo-2683373.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=600&fit=crop&q=80',
  ],
  valencia_orange: [
    // Verified Pexels orange images
    'https://images.pexels.com/photos/1937743/pexels-photo-1937743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1002778/pexels-photo-1002778.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=600&fit=crop&q=80',
  ],
  blood_orange: [
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1597714026720-8f74c62310ba?w=800&h=600&fit=crop&q=80',
  ],
  grapefruit: [
    // Verified Pexels grapefruit images
    'https://images.pexels.com/photos/209549/pexels-photo-209549.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/3471790/pexels-photo-3471790.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/4936470/pexels-photo-4936470.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  ],
  ruby_red_grapefruit: [
    // Verified Pexels grapefruit images
    'https://images.pexels.com/photos/209549/pexels-photo-209549.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/3471790/pexels-photo-3471790.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  ],
  rio_star_grapefruit: [
    // Verified Pexels grapefruit images
    'https://images.pexels.com/photos/209549/pexels-photo-209549.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/4936470/pexels-photo-4936470.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/3471790/pexels-photo-3471790.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  ],
  lemon: [
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587496679742-bad502958fbf?w=800&h=600&fit=crop&q=80',
  ],
  meyer_lemon: [
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587496679742-bad502958fbf?w=800&h=600&fit=crop&q=80',
  ],
  tangerine: [
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&h=600&fit=crop&q=80',
  ],
  lime: [
    'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800&h=600&fit=crop&q=80',
  ],
  peach: [
    'https://images.unsplash.com/photo-1629226182803-39e0fbeb0c37?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595124264441-11c8c2a9a50c?w=800&h=600&fit=crop&q=80',
  ],
  cherry: [
    'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=600&fit=crop&q=80',
  ],
  plum: ['https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&h=600&fit=crop&q=80'],
  apricot: ['https://images.unsplash.com/photo-1592681820643-80e26e3c9f2f?w=800&h=600&fit=crop&q=80'],
  nectarine: ['https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&h=600&fit=crop&q=80'],
  apple: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800&h=600&fit=crop&q=80',
  ],
  pear: ['https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=800&h=600&fit=crop&q=80'],
  strawberry: [
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543528176-61b239494933?w=800&h=600&fit=crop&q=80',
  ],
  blueberry: [
    'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1457296898342-cdd24f4aec6f?w=800&h=600&fit=crop&q=80',
  ],
  raspberry: ['https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=800&h=600&fit=crop&q=80'],
  blackberry: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&h=600&fit=crop&q=80'],
  tomato: [
    'https://images.unsplash.com/photo-1546470427-227c7369a9b6?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&h=600&fit=crop&q=80',
  ],
  pepper: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=600&fit=crop&q=80'],
  carrot: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&h=600&fit=crop&q=80'],
  potato: ['https://images.unsplash.com/photo-1518977676601-b53f82afe52a?w=800&h=600&fit=crop&q=80'],
  onion: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&h=600&fit=crop&q=80'],
  garlic: ['https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&h=600&fit=crop&q=80'],
  pecan: ['https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&h=600&fit=crop&q=80'],
  walnut: ['https://images.unsplash.com/photo-1563412885-139e4045ec60?w=800&h=600&fit=crop&q=80'],
  almond: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&h=600&fit=crop&q=80'],
  pork: ['https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&h=600&fit=crop&q=80'],
  heritage_pork: ['https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&h=600&fit=crop&q=80'],
  chicken: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&h=600&fit=crop&q=80'],
  pasture_chicken: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&h=600&fit=crop&q=80'],
  eggs: [
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=800&h=600&fit=crop&q=80',
  ],
  honey: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop&q=80',
  ],
  maple_syrup: ['https://images.unsplash.com/photo-1589496933738-f5c27bc146e3?w=800&h=600&fit=crop&q=80'],
  // Category fallbacks
  fruit: [
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=600&fit=crop&q=80',
  ],
  vegetable: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&h=600&fit=crop&q=80',
  ],
  citrus: [
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=600&fit=crop&q=80',
  ],
  nut: ['https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&h=600&fit=crop&q=80'],
  meat: ['https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&h=600&fit=crop&q=80'],
  dairy: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=600&fit=crop&q=80'],
  processed: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&q=80'],
}

/**
 * Simple hash function that produces consistent results for the same input
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a product image URL based on variety, product, category, and a unique identifier
 *
 * The uniqueId should be something that's consistent across pages for the same item,
 * typically `regionId_varietyId` (e.g., "indian_river_navel_orange")
 *
 * This ensures:
 * - Same region+variety always shows the same image
 * - Different regions with the same variety show different images
 */
export function getProductImage(
  varietyId: string,
  productId: string,
  category: string,
  uniqueId: string
): string {
  const varietyKey = varietyId.toLowerCase().replace(/-/g, '_')
  const productKey = productId.toLowerCase().replace(/-/g, '_')

  // Find the image pool (variety-specific, product-level, or category fallback)
  const pool = PRODUCT_IMAGE_POOLS[varietyKey]
    || PRODUCT_IMAGE_POOLS[productKey]
    || PRODUCT_IMAGE_POOLS[category]
    || PRODUCT_IMAGE_POOLS.fruit

  // Use hash of uniqueId to deterministically select from pool
  const hash = hashString(uniqueId)
  const index = hash % pool.length

  return pool[index]
}
