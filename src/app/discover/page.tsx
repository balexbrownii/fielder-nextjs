'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useGeolocation, DEFAULT_LOCATION, FALLBACK_CITIES } from '@/lib/hooks/useGeolocation'
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

// High-quality food photography from Unsplash (free to use)
const PRODUCT_IMAGES: Record<string, string> = {
  // Citrus
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop',
  grapefruit: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400&h=300&fit=crop',
  lemon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=300&fit=crop',
  tangerine: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&h=300&fit=crop',
  lime: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=300&fit=crop',
  // Stone fruit
  peach: 'https://images.unsplash.com/photo-1629226182803-39e0fbeb0c37?w=400&h=300&fit=crop',
  cherry: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400&h=300&fit=crop',
  plum: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&h=300&fit=crop',
  apricot: 'https://images.unsplash.com/photo-1592681820643-80e26e3c9f2f?w=400&h=300&fit=crop',
  nectarine: 'https://images.unsplash.com/photo-1629226182803-39e0fbeb0c37?w=400&h=300&fit=crop',
  // Pome fruit
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
  pear: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=400&h=300&fit=crop',
  // Berries
  strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop',
  blueberry: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop',
  raspberry: 'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=400&h=300&fit=crop',
  blackberry: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop',
  // Vegetables
  tomato: 'https://images.unsplash.com/photo-1546470427-227c7369a9b6?w=400&h=300&fit=crop',
  pepper: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82afe52a?w=400&h=300&fit=crop',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&h=300&fit=crop',
  // Nuts
  pecan: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=300&fit=crop',
  walnut: 'https://images.unsplash.com/photo-1563412885-139e4045ec60?w=400&h=300&fit=crop',
  almond: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=300&fit=crop',
  // Meat & Dairy
  pork: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=300&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
  // Honey & Processed
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
  maple_syrup: 'https://images.unsplash.com/photo-1589496933738-f5c27bc146e3?w=400&h=300&fit=crop',
  // Default fallbacks by category
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
  nut: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=300&fit=crop',
  meat: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=300&fit=crop',
  dairy: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
  processed: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
}

function getProductImage(productId: string, category: string): string {
  return PRODUCT_IMAGES[productId] || PRODUCT_IMAGES[category] || PRODUCT_IMAGES.fruit
}

export default function DiscoverPage() {
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation(true)
  const filterState = useFilters()
  const [data, setData] = useState<DiscoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [zipInput, setZipInput] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)
  const [lookingUpZip, setLookingUpZip] = useState(false)

  // Reverse geocode to get location name
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

  const activeLocation = useMemo(() => {
    if (manualLocation) return manualLocation
    if (location) return { ...location, name: locationName || 'your location' }
    if (geoError) return DEFAULT_LOCATION
    return null
  }, [location?.lat, location?.lon, geoError, manualLocation, locationName])

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

  const handleCitySelect = useCallback((city: typeof FALLBACK_CITIES[0]) => {
    setManualLocation(city)
    setShowLocationPicker(false)
  }, [])

  const handleUseDeviceLocation = useCallback(() => {
    setManualLocation(null)
    setLocationName(null)
    requestLocation()
    setShowLocationPicker(false)
  }, [requestLocation])

  // Fetch data
  useEffect(() => {
    if (!activeLocation) return
    setLoading(true)
    setError(null)
    const queryString = filterState.buildQueryString(activeLocation.lat, activeLocation.lon)
    fetch(`/api/discover?${queryString}`)
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          setError(result.error)
        } else {
          setData(result)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load data')
        setLoading(false)
      })
  }, [activeLocation?.lat, activeLocation?.lon, filterState.buildQueryString])

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold text-stone-900">
            Discover Fresh Produce
          </h1>

          {/* Location Button */}
          {activeLocation && (
            <div className="mt-4 relative inline-block">
              <button
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="inline-flex items-center gap-2 text-stone-600 hover:text-[var(--color-accent)] transition-colors"
              >
                <LocationIcon className="h-4 w-4" />
                <span className="underline decoration-dotted underline-offset-2">
                  {activeLocation.name === 'your location' ? 'Near you' : activeLocation.name}
                </span>
              </button>

              {/* Location Picker */}
              {showLocationPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLocationPicker(false)} />
                  <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-xl bg-white p-4 shadow-xl ring-1 ring-stone-200">
                    <div className="mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={zipInput}
                          onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          placeholder="ZIP code"
                          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                          onKeyDown={(e) => e.key === 'Enter' && handleZipLookup()}
                        />
                        <button
                          onClick={handleZipLookup}
                          disabled={lookingUpZip}
                          className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
                        >
                          Go
                        </button>
                      </div>
                      {zipError && <p className="mt-1 text-xs text-red-600">{zipError}</p>}
                    </div>
                    <button
                      onClick={handleUseDeviceLocation}
                      className="w-full text-left px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 rounded-lg mb-2"
                    >
                      Use my location
                    </button>
                    <div className="border-t border-stone-100 pt-2 max-h-40 overflow-y-auto">
                      {FALLBACK_CITIES.slice(0, 8).map((city) => (
                        <button
                          key={city.name}
                          onClick={() => handleCitySelect(city)}
                          className="w-full text-left px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 rounded"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          <FilterSidebar filterState={filterState} categoryCounts={data?.categoryCounts || {}} />

          <div className="flex-1 min-w-0">
            {/* Loading */}
            {(geoLoading || loading) && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-stone-200 border-t-stone-900" />
                <p className="mt-4 text-stone-500">Loading...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 p-6 text-center">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <div className="space-y-12">
                {/* At Peak */}
                {data.atPeak.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-peak)]" />
                      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
                        At Peak ({data.atPeak.length})
                      </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {data.atPeak.map((item) => (
                        <ProductCard key={item.id} item={item} status="peak" />
                      ))}
                    </div>
                  </section>
                )}

                {/* In Season */}
                {data.inSeason.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-season)]" />
                      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
                        In Season ({data.inSeason.length})
                      </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {data.inSeason.map((item) => (
                        <ProductCard key={item.id} item={item} status="season" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Approaching */}
                {data.approaching.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-approaching)]" />
                      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
                        Coming Soon ({data.approaching.length})
                      </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {data.approaching.map((item) => (
                        <ProductCard key={item.id} item={item} status="approaching" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Off Season */}
                {data.offSeason.length > 0 && filterState.filters.status.includes('off_season') && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
                      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
                        Off Season ({data.offSeason.length})
                      </h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {data.offSeason.map((item) => (
                        <ProductCard key={item.id} item={item} status="off" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty */}
                {data.totalResults === 0 && (
                  <div className="text-center py-16">
                    <p className="text-stone-600">No results found. Try adjusting your filters.</p>
                    <button
                      onClick={() => filterState.resetFilters()}
                      className="mt-4 text-[var(--color-accent)] hover:underline"
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

function ProductCard({ item, status }: { item: DiscoveryItem; status: 'peak' | 'season' | 'approaching' | 'off' }) {
  const href = `/predictions/${item.regionSlug}/${item.varietyId.replace(/_/g, '-').toLowerCase()}`
  const imageUrl = getProductImage(item.productId, item.category)

  const statusColors = {
    peak: 'bg-[var(--color-peak)] text-white',
    season: 'bg-[var(--color-season)] text-white',
    approaching: 'bg-[var(--color-approaching)] text-white',
    off: 'bg-stone-400 text-white',
  }

  const statusLabels = {
    peak: 'At Peak',
    season: 'In Season',
    approaching: item.daysUntilStart ? `${item.daysUntilStart}d` : 'Soon',
    off: 'Off Season',
  }

  return (
    <Link
      href={href}
      className={`group block rounded-xl bg-white overflow-hidden shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-lg hover:ring-stone-300 ${status === 'off' ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <div className="relative h-40 bg-stone-100">
        <Image
          src={imageUrl}
          alt={item.varietyDisplayName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {item.varietyDisplayName}
        </h3>
        <p className="text-sm text-stone-500">{item.productDisplayName}</p>

        {/* Flavor Profile */}
        {item.flavorProfile && (
          <p className="mt-2 text-sm text-stone-600 line-clamp-2">{item.flavorProfile}</p>
        )}

        {/* Location */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-stone-500">{item.regionDisplayName}, {item.state}</span>
          <span className="font-medium text-stone-700">{item.distanceMiles} mi</span>
        </div>

        {/* Quality Tier */}
        {item.qualityTier && status !== 'off' && (
          <div className="mt-2">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {item.qualityTier}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
