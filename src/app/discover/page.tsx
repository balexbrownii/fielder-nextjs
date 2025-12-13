'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useGeolocation, DEFAULT_LOCATION } from '@/lib/hooks/useGeolocation'
import { useFilters } from '@/lib/hooks/useFilters'
import { FilterSidebar } from '@/components/FilterSidebar'

interface DiscoveryItem {
  id: string
  offeringId: string
  varietyId: string
  productId: string
  regionId: string
  status: string
  statusMessage: string | null
  harvestStart: string | null
  harvestEnd: string | null
  optimalStart: string | null
  optimalEnd: string | null
  daysUntilStart: number | null
  confidence: number
  distanceMiles: number
  category: string
  subcategory: string
  modelType: string
  qualityTier: string | null
  brix: number | null
  acidity: number | null
  brixAcidRatio: number | null
  isHeritage: boolean
  isNonGmo: boolean
  productDisplayName: string
  varietyDisplayName: string
  regionDisplayName: string
  regionSlug: string
  state: string
  flavorProfile: string | null
  flavorNotes: string | null
  regionLat: number
  regionLon: number
}

interface DiscoveryData {
  atPeak: DiscoveryItem[]
  inSeason: DiscoveryItem[]
  approaching: DiscoveryItem[]
  offSeason: DiscoveryItem[]
  totalResults: number
  categoryCounts: Record<string, number>
  source: string
  timestamp: string
}

// Multiple high-quality images per product type for visual variety
// Each item gets a deterministic image based on its ID, so different farms look different
const PRODUCT_IMAGE_POOLS: Record<string, string[]> = {
  orange: [
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=600&h=450&fit=crop&q=80',
  ],
  navel_orange: [
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&h=450&fit=crop&q=80',
  ],
  valencia_orange: [
    'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=450&fit=crop&q=80',
  ],
  blood_orange: [
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1597714026720-8f74c62310ba?w=600&h=450&fit=crop&q=80',
  ],
  grapefruit: [
    'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568305473490-4a3f4b4b3e9a?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600577916195-23daae7f32c8?w=600&h=450&fit=crop&q=80',
  ],
  ruby_red_grapefruit: [
    'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600577916195-23daae7f32c8?w=600&h=450&fit=crop&q=80',
  ],
  lemon: [
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587496679742-bad502958fbf?w=600&h=450&fit=crop&q=80',
  ],
  meyer_lemon: [
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1587496679742-bad502958fbf?w=600&h=450&fit=crop&q=80',
  ],
  tangerine: [
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=450&fit=crop&q=80',
  ],
  lime: [
    'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=450&fit=crop&q=80',
  ],
  peach: [
    'https://images.unsplash.com/photo-1629226182803-39e0fbeb0c37?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595124264441-11c8c2a9a50c?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&h=450&fit=crop&q=80',
  ],
  cherry: [
    'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=450&fit=crop&q=80',
  ],
  plum: [
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&h=450&fit=crop&q=80',
  ],
  apricot: [
    'https://images.unsplash.com/photo-1592681820643-80e26e3c9f2f?w=600&h=450&fit=crop&q=80',
  ],
  nectarine: [
    'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=450&fit=crop&q=80',
  ],
  apple: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=450&fit=crop&q=80',
  ],
  pear: [
    'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&h=450&fit=crop&q=80',
  ],
  strawberry: [
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543528176-61b239494933?w=600&h=450&fit=crop&q=80',
  ],
  blueberry: [
    'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1457296898342-cdd24f4aec6f?w=600&h=450&fit=crop&q=80',
  ],
  raspberry: [
    'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=600&h=450&fit=crop&q=80',
  ],
  blackberry: [
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=450&fit=crop&q=80',
  ],
  tomato: [
    'https://images.unsplash.com/photo-1546470427-227c7369a9b6?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=450&fit=crop&q=80',
  ],
  pepper: [
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=450&fit=crop&q=80',
  ],
  carrot: [
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=450&fit=crop&q=80',
  ],
  potato: [
    'https://images.unsplash.com/photo-1518977676601-b53f82afe52a?w=600&h=450&fit=crop&q=80',
  ],
  onion: [
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&h=450&fit=crop&q=80',
  ],
  garlic: [
    'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&h=450&fit=crop&q=80',
  ],
  pecan: [
    'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=450&fit=crop&q=80',
  ],
  walnut: [
    'https://images.unsplash.com/photo-1563412885-139e4045ec60?w=600&h=450&fit=crop&q=80',
  ],
  almond: [
    'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&h=450&fit=crop&q=80',
  ],
  pork: [
    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=450&fit=crop&q=80',
  ],
  heritage_pork: [
    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=450&fit=crop&q=80',
  ],
  chicken: [
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=450&fit=crop&q=80',
  ],
  pasture_chicken: [
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=450&fit=crop&q=80',
  ],
  eggs: [
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=600&h=450&fit=crop&q=80',
  ],
  honey: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=450&fit=crop&q=80',
  ],
  maple_syrup: [
    'https://images.unsplash.com/photo-1589496933738-f5c27bc146e3?w=600&h=450&fit=crop&q=80',
  ],
  // Category fallbacks
  fruit: [
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=450&fit=crop&q=80',
  ],
  vegetable: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&h=450&fit=crop&q=80',
  ],
  citrus: [
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=450&fit=crop&q=80',
  ],
  nut: [
    'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=450&fit=crop&q=80',
  ],
  meat: [
    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=450&fit=crop&q=80',
  ],
  dairy: [
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=450&fit=crop&q=80',
  ],
  processed: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=450&fit=crop&q=80',
  ],
}

// Simple hash function to get consistent index from item ID
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Global counter to ensure each card gets a different image
let imageCounter = 0

function getProductImage(productId: string, varietyId: string, category: string): string {
  const varietyKey = varietyId.toLowerCase().replace(/-/g, '_')
  const productKey = productId.toLowerCase().replace(/-/g, '_')

  // Find the image pool (variety-specific, product-level, or category fallback)
  const pool = PRODUCT_IMAGE_POOLS[varietyKey] || PRODUCT_IMAGE_POOLS[productKey] || PRODUCT_IMAGE_POOLS[category] || PRODUCT_IMAGE_POOLS.fruit

  // Simply cycle through images
  const index = imageCounter % pool.length
  imageCounter++

  return pool[index]
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function DiscoverPageContent() {
  const searchParams = useSearchParams()
  // Auto-request geolocation, but don't fallback to a fake default if it fails
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation(true)
  const filterState = useFilters()
  const [data, setData] = useState<DiscoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [locationName, setLocationName] = useState<string>('')
  const [zipInput, setZipInput] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)
  const [lookingUpZip, setLookingUpZip] = useState(false)
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false)
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false)
  // Track if user has explicitly set a location (for distance display)
  const hasUserLocation = manualLocation !== null || location !== null

  // Handle URL params for lat/lon (e.g., from product page "View Live Status" link)
  useEffect(() => {
    if (urlParamsProcessed) return

    const urlLat = searchParams.get('lat')
    const urlLon = searchParams.get('lon')

    if (urlLat && urlLon) {
      const lat = parseFloat(urlLat)
      const lon = parseFloat(urlLon)

      if (!isNaN(lat) && !isNaN(lon)) {
        // Set location IMMEDIATELY with coords, use temporary name
        setManualLocation({ lat, lon, name: `${lat.toFixed(2)}, ${lon.toFixed(2)}` })

        // Then reverse geocode to get a nicer name (async update)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(res => res.json())
          .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county
            const state = data.address?.state
            if (city && state) {
              // Update just the name, keep same coords
              setManualLocation(prev => prev ? { ...prev, name: `${city}, ${state}` } : prev)
            }
          })
          .catch(() => {
            // Keep the coordinate-based name on error
          })
      }
    }
    setUrlParamsProcessed(true)
  }, [searchParams, urlParamsProcessed])

  useEffect(() => {
    if (location && !manualLocation) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`)
        .then(res => res.json())
        .then(data => {
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county
          const state = data.address?.state
          if (city && state) {
            setLocationName(`${city}, ${state}`)
          }
        })
        .catch(() => {})
    }
  }, [location?.lat, location?.lon, manualLocation])

  // activeLocation: user's explicit location, or null if not set
  // We use a central US point for API calls when no location is set (for reasonable results)
  // but we don't pretend this is the user's location
  const activeLocation = useMemo(() => {
    if (manualLocation) return manualLocation
    if (location) return { ...location, name: locationName || 'Your Location' }
    return null
  }, [location?.lat, location?.lon, manualLocation, locationName])

  // For API calls, use center of US if no user location (just to get results)
  const apiLocation = activeLocation || { lat: 39.8283, lon: -98.5795, name: 'United States' }

  const handleZipLookup = useCallback(async () => {
    if (!zipInput || zipInput.length < 5) {
      setZipError('Enter a valid 5-digit ZIP')
      return
    }
    setLookingUpZip(true)
    setZipError(null)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${zipInput}&country=US&format=json&limit=1`)
      const data = await res.json()
      if (data && data.length > 0) {
        setManualLocation({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: data[0].display_name.split(',').slice(0, 2).join(',').trim()
        })
        setShowLocationPicker(false)
        setZipInput('')
      } else {
        setZipError('ZIP not found')
      }
    } catch {
      setZipError('Lookup failed')
    } finally {
      setLookingUpZip(false)
    }
  }, [zipInput])


  const handleUseDeviceLocation = useCallback(() => {
    setManualLocation(null)
    setLocationName(DEFAULT_LOCATION.name)
    requestLocation()
    setShowLocationPicker(false)
  }, [requestLocation])

  useEffect(() => {
    if (!hasLoadedInitial) {
      setHasLoadedInitial(true)
    }
  }, [hasLoadedInitial])

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Use apiLocation for the API call (always has coordinates)
    // Sort by name instead of distance when user hasn't set location
    const queryString = filterState.buildQueryString(apiLocation.lat, apiLocation.lon)
    fetch(`/api/discover?${queryString}`)
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          setError(result.error)
        } else {
          // If no user location, sort alphabetically by variety name instead of by distance
          if (!hasUserLocation) {
            const sortAlpha = (items: DiscoveryItem[]) =>
              [...items].sort((a, b) => a.varietyDisplayName.localeCompare(b.varietyDisplayName))
            setData({
              ...result,
              atPeak: sortAlpha(result.atPeak),
              inSeason: sortAlpha(result.inSeason),
              approaching: sortAlpha(result.approaching),
              offSeason: sortAlpha(result.offSeason),
            })
          } else {
            setData(result)
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load data')
        setLoading(false)
      })
  }, [apiLocation.lat, apiLocation.lon, filterState.buildQueryString, hasUserLocation])

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Header />

      {/* Hero */}
      <section className="border-b border-stone-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
            Discover Fresh Produce
          </h1>

          {/* Location */}
          <div className="mt-4 relative inline-block">
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="inline-flex items-center gap-2 font-mono text-sm text-stone-600 hover:text-[var(--color-accent)] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`border-b border-dashed uppercase tracking-wider ${activeLocation ? 'border-stone-400' : 'border-[var(--color-accent)] text-[var(--color-accent)]'}`}>
                {activeLocation ? activeLocation.name : 'Set your location'}
              </span>
            </button>

            {/* Location Picker */}
            {showLocationPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLocationPicker(false)} />
                <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-[var(--color-cream)] p-4 shadow-md border border-stone-300">
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={zipInput}
                        onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="ZIP code"
                        className="flex-1 border border-stone-300 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-accent)] bg-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleZipLookup()}
                      />
                      <button
                        onClick={handleZipLookup}
                        disabled={lookingUpZip}
                        className="bg-stone-900 px-3 py-2 font-mono text-xs uppercase tracking-wider text-white hover:bg-stone-800"
                      >
                        Go
                      </button>
                    </div>
                    {zipError && <p className="mt-1 font-mono text-xs text-red-600">{zipError}</p>}
                  </div>
                  <button
                    onClick={handleUseDeviceLocation}
                    className="w-full text-left px-3 py-2 font-mono text-sm text-[var(--color-accent)] hover:underline"
                  >
                    Use my current location
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <FilterSidebar filterState={filterState} categoryCounts={data?.categoryCounts || {}} />

          <div className="flex-1 min-w-0">
            {/* Loading */}
            {(geoLoading || loading) && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
                <p className="mt-4 font-mono text-sm text-stone-500 uppercase tracking-wider">Loading...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-[var(--color-cream)] border border-stone-300 p-6 text-center">
                <p className="font-serif text-stone-700">{error}</p>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <div className="space-y-16">
                {/* At Peak */}
                {data.atPeak.length > 0 && (
                  <section>
                    <div className="mb-8">
                      <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
                        At Peak Now
                      </span>
                      <h2 className="mt-1 font-serif text-2xl text-stone-900">
                        Best of the Season ({data.atPeak.length})
                      </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {data.atPeak.map((item) => (
                        <ProductCard key={item.id} item={item} status="peak" showDistance={hasUserLocation} />
                      ))}
                    </div>
                  </section>
                )}

                {/* In Season */}
                {data.inSeason.length > 0 && (
                  <section>
                    <div className="mb-8">
                      <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
                        In Season
                      </span>
                      <h2 className="mt-1 font-serif text-2xl text-stone-900">
                        Available Now ({data.inSeason.length})
                      </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {data.inSeason.map((item) => (
                        <ProductCard key={item.id} item={item} status="season" showDistance={hasUserLocation} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Approaching */}
                {data.approaching.length > 0 && (
                  <section>
                    <div className="mb-8">
                      <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
                        Coming Soon
                      </span>
                      <h2 className="mt-1 font-serif text-2xl text-stone-900">
                        On the Horizon ({data.approaching.length})
                      </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {data.approaching.map((item) => (
                        <ProductCard key={item.id} item={item} status="approaching" showDistance={hasUserLocation} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Off Season */}
                {data.offSeason.length > 0 && filterState.filters.status.includes('off_season') && (
                  <section>
                    <div className="mb-8">
                      <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
                        Off Season
                      </span>
                      <h2 className="mt-1 font-serif text-2xl text-stone-900">
                        Check Back Later ({data.offSeason.length})
                      </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {data.offSeason.map((item) => (
                        <ProductCard key={item.id} item={item} status="off" showDistance={hasUserLocation} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty */}
                {data.totalResults === 0 && (
                  <div className="text-center py-16">
                    <p className="font-serif text-stone-600">No results found. Try adjusting your filters.</p>
                    <button
                      onClick={() => filterState.resetFilters()}
                      className="mt-4 font-mono text-sm text-[var(--color-accent)] hover:underline uppercase tracking-wider"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f3ef]">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
        </div>
      </div>
    }>
      <DiscoverPageContent />
    </Suspense>
  )
}

function ProductCard({ item, status, showDistance }: { item: DiscoveryItem; status: 'peak' | 'season' | 'approaching' | 'off'; showDistance: boolean }) {
  const href = `/predictions/${item.regionSlug}/${item.varietyId.replace(/_/g, '-').toLowerCase()}`
  const imageUrl = getProductImage(item.productId, item.varietyId, item.category)

  return (
    <Link href={href} className={`group block bg-[var(--color-cream)] border border-stone-300 shadow-sm hover:shadow-md transition-shadow ${status === 'off' ? 'opacity-60' : ''}`}>
      {/* Card with padding around image */}
      <div className="p-3">
        {/* Inset Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white border border-stone-200">
          <Image
            src={imageUrl}
            alt={item.varietyDisplayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          {/* Status Badge */}
          {status === 'peak' && (
            <div className="absolute top-2 left-2">
              <span className="font-mono text-xs uppercase tracking-wider px-2 py-1 bg-[var(--color-accent)] text-white">
                Peak
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content - Notecard Style */}
      <div className="px-4 pb-4">
        {/* Title */}
        <h3 className="font-serif text-lg text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {item.varietyDisplayName}
        </h3>

        {/* Specs - Typewriter style */}
        <dl className="mt-3 space-y-1 font-mono text-xs text-stone-500">
          <div className="flex">
            <dt className="w-16 uppercase tracking-wide">Cultivar</dt>
            <dd className="text-stone-700">{item.productDisplayName}</dd>
          </div>
          <div className="flex">
            <dt className="w-16 uppercase tracking-wide">Origin</dt>
            <dd className="text-stone-700">{item.regionDisplayName}, {item.state}</dd>
          </div>
          {item.harvestStart && (
            <div className="flex">
              <dt className="w-16 uppercase tracking-wide">Harvest</dt>
              <dd className="text-stone-700">{formatDate(item.harvestStart)} – {formatDate(item.harvestEnd)}</dd>
            </div>
          )}
          {item.brix && (
            <div className="flex">
              <dt className="w-16 uppercase tracking-wide">Brix</dt>
              <dd className="text-stone-700">{item.brix}°</dd>
            </div>
          )}
          {showDistance && (
            <div className="flex">
              <dt className="w-16 uppercase tracking-wide">Distance</dt>
              <dd className="text-stone-700">{item.distanceMiles} mi</dd>
            </div>
          )}
        </dl>

        {/* Flavor Profile */}
        {item.flavorProfile && (
          <p className="mt-3 font-serif text-sm text-stone-600 italic line-clamp-2">
            &ldquo;{item.flavorProfile}&rdquo;
          </p>
        )}

        {/* Quality Tier */}
        {item.qualityTier && status !== 'off' && (
          <div className="mt-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
              {item.qualityTier}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
