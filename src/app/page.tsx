'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useGeolocation, DEFAULT_LOCATION, FALLBACK_CITIES } from '@/lib/hooks/useGeolocation'

interface DiscoveryItem {
  id: string
  offeringId: string
  varietyId: string
  productId: string
  regionId: string
  status: 'at_peak' | 'in_season' | 'approaching' | 'off_season'
  statusMessage: string
  harvestStart?: string | null
  harvestEnd?: string | null
  optimalStart?: string | null
  optimalEnd?: string | null
  daysUntilStart?: number | null
  confidence: number
  distanceMiles: number
  category: string
  subcategory: string
  modelType: string
  qualityTier?: string
  productDisplayName: string
  varietyDisplayName: string
  regionDisplayName: string
  regionSlug: string
  state: string
  flavorProfile?: string
  flavorNotes?: string | null
  seasons: string[]
}

interface DiscoveryResponse {
  atPeak: DiscoveryItem[]
  inSeason: DiscoveryItem[]
  approaching: DiscoveryItem[]
  offSeason: DiscoveryItem[]
  totalResults: number
  categoryCounts: Record<string, number>
  seasonCounts: Record<string, number>
  currentSeason: string
  source: string
  timestamp: string
}

// High-quality food photography from Unsplash
const PRODUCT_IMAGES: Record<string, string> = {
  // Citrus
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop&q=80',
  navel_orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop&q=80',
  valencia_orange: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=400&fit=crop&q=80',
  blood_orange: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=400&fit=crop&q=80',
  grapefruit: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=400&fit=crop&q=80',
  ruby_red_grapefruit: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=400&fit=crop&q=80',
  lemon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=400&fit=crop&q=80',
  meyer_lemon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=400&fit=crop&q=80',
  tangerine: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=400&fit=crop&q=80',
  lime: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&h=400&fit=crop&q=80',
  // Stone fruit
  peach: 'https://images.unsplash.com/photo-1629226182803-39e0fbeb0c37?w=600&h=400&fit=crop&q=80',
  cherry: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&h=400&fit=crop&q=80',
  plum: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&h=400&fit=crop&q=80',
  apricot: 'https://images.unsplash.com/photo-1592681820643-80e26e3c9f2f?w=600&h=400&fit=crop&q=80',
  nectarine: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=400&fit=crop&q=80',
  // Pome fruit
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=400&fit=crop&q=80',
  pear: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&h=400&fit=crop&q=80',
  // Berries
  strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=400&fit=crop&q=80',
  blueberry: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=400&fit=crop&q=80',
  raspberry: 'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=600&h=400&fit=crop&q=80',
  blackberry: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=400&fit=crop&q=80',
  // Vegetables
  tomato: 'https://images.unsplash.com/photo-1546470427-227c7369a9b6?w=600&h=400&fit=crop&q=80',
  pepper: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=400&fit=crop&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=400&fit=crop&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82afe52a?w=600&h=400&fit=crop&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&h=400&fit=crop&q=80',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&h=400&fit=crop&q=80',
  // Nuts
  pecan: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=400&fit=crop&q=80',
  walnut: 'https://images.unsplash.com/photo-1563412885-139e4045ec60?w=600&h=400&fit=crop&q=80',
  almond: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&h=400&fit=crop&q=80',
  // Meat & Dairy
  pork: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=400&fit=crop&q=80',
  chicken: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=400&fit=crop&q=80',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop&q=80',
  // Honey & Processed
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop&q=80',
  maple_syrup: 'https://images.unsplash.com/photo-1589496933738-f5c27bc146e3?w=600&h=400&fit=crop&q=80',
  // Category fallbacks
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=400&fit=crop&q=80',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop&q=80',
  citrus: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=400&fit=crop&q=80',
  nut: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=400&fit=crop&q=80',
  meat: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=400&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop&q=80',
  processed: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop&q=80',
}

function getProductImage(productId: string, varietyId: string, category: string): string {
  // Try variety first, then product, then category
  const varietyKey = varietyId.toLowerCase().replace(/-/g, '_')
  const productKey = productId.toLowerCase().replace(/-/g, '_')
  return PRODUCT_IMAGES[varietyKey] || PRODUCT_IMAGES[productKey] || PRODUCT_IMAGES[category] || PRODUCT_IMAGES.fruit
}

const SEASON_MESSAGES: Record<string, string> = {
  winter: "Cold nights concentrate sugars in the groves. Citrus season is at its sweetest.",
  spring: "Tender greens and early berries emerge as the earth warms.",
  summer: "Stone fruits at their sun-ripened best. Peaches, cherries, and melons abound.",
  fall: "Harvest time brings apples from the orchard and the year's final bounty.",
}

export default function Home() {
  const { location: geoLocation, error: geoError, requestLocation } = useGeolocation(true)
  const [atPeak, setAtPeak] = useState<DiscoveryItem[]>([])
  const [inSeason, setInSeason] = useState<DiscoveryItem[]>([])
  const [approaching, setApproaching] = useState<DiscoveryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSeason, setCurrentSeason] = useState<string>('winter')
  const [locationName, setLocationName] = useState<string>(DEFAULT_LOCATION.name)
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false)

  const fetchDiscoveryData = useCallback(async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        status: 'at_peak,in_season,approaching',
      })

      const response = await fetch(`/api/discover?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')

      const data: DiscoveryResponse = await response.json()
      setAtPeak(data.atPeak || [])
      setInSeason(data.inSeason || [])
      setApproaching(data.approaching || [])
      setCurrentSeason(data.currentSeason || 'winter')
    } catch {
      setError('Unable to load fresh produce data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load with default location immediately on mount
  useEffect(() => {
    if (!hasLoadedInitial) {
      setHasLoadedInitial(true)
      fetchDiscoveryData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
    }
  }, [hasLoadedInitial, fetchDiscoveryData])

  // When user selects a manual location
  useEffect(() => {
    if (manualLocation) {
      fetchDiscoveryData(manualLocation.lat, manualLocation.lon)
      setLocationName(manualLocation.name)
    }
  }, [manualLocation, fetchDiscoveryData])

  // When geolocation completes successfully
  useEffect(() => {
    if (geoLocation && !manualLocation) {
      fetchDiscoveryData(geoLocation.lat, geoLocation.lon)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${geoLocation.lat}&lon=${geoLocation.lon}&format=json`)
        .then(res => res.json())
        .then(data => {
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county
          const state = data.address?.state
          if (city && state) {
            const stateAbbr = STATE_ABBREVS[state] || state
            setLocationName(`${city}, ${stateAbbr}`)
          }
        })
        .catch(() => {})
    }
  }, [geoLocation, manualLocation, fetchDiscoveryData])

  const handleCitySelect = (city: typeof FALLBACK_CITIES[0]) => {
    setManualLocation({ lat: city.lat, lon: city.lon, name: city.name })
    setShowCityPicker(false)
  }

  const atPeakDisplay = atPeak.slice(0, 6)
  const inSeasonDisplay = inSeason.slice(0, 6)
  const approachingDisplay = approaching.slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#faf9f7] border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-stone-900 leading-tight">
              What&apos;s Fresh Near{' '}
              <button
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="text-[#c41e3a] hover:text-[#a01830] transition-colors border-b-2 border-dashed border-[#c41e3a]/40 hover:border-[#c41e3a]"
              >
                {locationName}
              </button>
            </h1>
            <p className="mt-4 text-lg text-stone-600 font-light">
              {SEASON_MESSAGES[currentSeason] || SEASON_MESSAGES.winter}
            </p>
          </div>

          {/* City Picker */}
          {showCityPicker && (
            <div className="mt-6 p-6 bg-white rounded-lg shadow-lg max-w-md border border-stone-200">
              <p className="text-sm font-medium text-stone-800 mb-4">Choose a location</p>
              <div className="grid grid-cols-2 gap-2">
                {FALLBACK_CITIES.slice(0, 10).map(city => (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className="text-left px-3 py-2 text-sm rounded hover:bg-[#faf9f7] transition-colors text-stone-700"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
              {geoError && (
                <button
                  onClick={() => { requestLocation(); setShowCityPicker(false) }}
                  className="mt-4 w-full text-center text-sm text-[#c41e3a] hover:underline"
                >
                  Use my location
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchDiscoveryData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)} />
        ) : (
          <div className="space-y-16">
            {/* At Peak Section */}
            {atPeakDisplay.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-widest text-[#c41e3a] uppercase">
                      At Peak Now
                    </span>
                    <h2 className="mt-1 font-serif text-2xl text-stone-900">
                      Best of the Season
                    </h2>
                  </div>
                  {atPeak.length > 6 && (
                    <Link href="/discover?status=at_peak" className="text-sm text-[#c41e3a] hover:underline">
                      View all
                    </Link>
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {atPeakDisplay.map(item => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* In Season Section */}
            {inSeasonDisplay.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                      In Season
                    </span>
                    <h2 className="mt-1 font-serif text-2xl text-stone-900">
                      Available Now
                    </h2>
                  </div>
                  {inSeason.length > 6 && (
                    <Link href="/discover?status=in_season" className="text-sm text-[#c41e3a] hover:underline">
                      View all
                    </Link>
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inSeasonDisplay.map(item => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Coming Soon Section */}
            {approachingDisplay.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                      Coming Soon
                    </span>
                    <h2 className="mt-1 font-serif text-2xl text-stone-900">
                      On the Horizon
                    </h2>
                  </div>
                  {approaching.length > 4 && (
                    <Link href="/discover?status=approaching" className="text-sm text-[#c41e3a] hover:underline">
                      View all
                    </Link>
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {approachingDisplay.map(item => (
                    <ProductCardSmall key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {atPeak.length === 0 && inSeason.length === 0 && approaching.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-stone-600">No produce data available for this location yet.</p>
                <Link href="/predictions" className="mt-4 inline-block text-[#c41e3a] hover:underline">
                  Browse by region
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Browse More */}
        {!loading && (atPeak.length > 0 || inSeason.length > 0) && (
          <section className="mt-20 py-16 border-t border-stone-200">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-serif text-2xl text-stone-900">
                Explore More
              </h2>
              <p className="mt-3 text-stone-600">
                Browse all growing regions or search by what you&apos;re looking for.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center px-8 py-3 bg-[#c41e3a] text-white font-medium hover:bg-[#a01830] transition-colors"
                >
                  Browse All Products
                </Link>
                <Link
                  href="/predictions"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-stone-900 font-medium border border-stone-300 hover:border-stone-400 hover:bg-stone-50 transition-colors"
                >
                  View Regions
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <span className="font-serif text-xl text-white">Fielder</span>
              <p className="mt-2 text-sm text-stone-400">
                Fresh produce at peak quality.
              </p>
            </div>
            <div className="flex gap-8">
              <Link href="/discover" className="text-sm text-stone-400 hover:text-white transition-colors">
                Discover
              </Link>
              <Link href="/predictions" className="text-sm text-stone-400 hover:text-white transition-colors">
                Regions
              </Link>
              <Link href="/farm" className="text-sm text-stone-400 hover:text-white transition-colors">
                For Farms
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800">
            <p className="text-sm text-stone-500">
              &copy; {new Date().getFullYear()} Fielder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ item }: { item: DiscoveryItem }) {
  const href = `/predictions/${item.regionSlug}/${item.varietyId.replace(/_/g, '-').toLowerCase()}`
  const imageUrl = getProductImage(item.productId, item.varietyId, item.category)

  return (
    <Link href={href} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={item.varietyDisplayName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Status Badge */}
        {item.status === 'at_peak' && (
          <div className="absolute top-3 left-3">
            <span className="inline-block bg-[#c41e3a] text-white text-xs font-semibold px-2.5 py-1">
              Peak
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="font-medium text-stone-900 group-hover:text-[#c41e3a] transition-colors">
          {item.varietyDisplayName}
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          {item.regionDisplayName}, {item.state}
        </p>
        {item.flavorProfile && (
          <p className="mt-2 text-sm text-stone-600 line-clamp-2">
            {item.flavorProfile}
          </p>
        )}
        <p className="mt-2 text-sm text-stone-400">
          {item.distanceMiles} miles away
        </p>
      </div>
    </Link>
  )
}

function ProductCardSmall({ item }: { item: DiscoveryItem }) {
  const href = `/predictions/${item.regionSlug}/${item.varietyId.replace(/_/g, '-').toLowerCase()}`
  const imageUrl = getProductImage(item.productId, item.varietyId, item.category)

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={item.varietyDisplayName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-sm text-stone-900 group-hover:text-[#c41e3a] transition-colors">
          {item.varietyDisplayName}
        </h3>
        <p className="text-xs text-stone-500">
          {item.regionDisplayName}
        </p>
      </div>
    </Link>
  )
}

function LoadingState() {
  return (
    <div className="space-y-16">
      <section>
        <div className="mb-8">
          <div className="h-3 w-24 bg-stone-200 rounded animate-pulse" />
          <div className="mt-2 h-7 w-40 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-stone-200 rounded" />
              <div className="mt-4 h-5 w-3/4 bg-stone-200 rounded" />
              <div className="mt-2 h-4 w-1/2 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <p className="text-lg text-stone-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-6 py-3 bg-[#c41e3a] text-white font-medium hover:bg-[#a01830] transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

const STATE_ABBREVS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
}
