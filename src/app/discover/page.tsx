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

// High-quality food photography from Unsplash
const PRODUCT_IMAGES: Record<string, string> = {
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=450&fit=crop&q=80',
  navel_orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=450&fit=crop&q=80',
  valencia_orange: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&h=450&fit=crop&q=80',
  blood_orange: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
  grapefruit: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=450&fit=crop&q=80',
  ruby_red_grapefruit: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=450&fit=crop&q=80',
  lemon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=450&fit=crop&q=80',
  meyer_lemon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&h=450&fit=crop&q=80',
  tangerine: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
  lime: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&h=450&fit=crop&q=80',
  peach: 'https://images.unsplash.com/photo-1629226182803-39e0fbeb0c37?w=600&h=450&fit=crop&q=80',
  cherry: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&h=450&fit=crop&q=80',
  plum: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&h=450&fit=crop&q=80',
  apricot: 'https://images.unsplash.com/photo-1592681820643-80e26e3c9f2f?w=600&h=450&fit=crop&q=80',
  nectarine: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=450&fit=crop&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=450&fit=crop&q=80',
  pear: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&h=450&fit=crop&q=80',
  strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=450&fit=crop&q=80',
  blueberry: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=450&fit=crop&q=80',
  raspberry: 'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=600&h=450&fit=crop&q=80',
  blackberry: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=450&fit=crop&q=80',
  tomato: 'https://images.unsplash.com/photo-1546470427-227c7369a9b6?w=600&h=450&fit=crop&q=80',
  pepper: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=450&fit=crop&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=450&fit=crop&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82afe52a?w=600&h=450&fit=crop&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&h=450&fit=crop&q=80',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&h=450&fit=crop&q=80',
  pecan: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=450&fit=crop&q=80',
  walnut: 'https://images.unsplash.com/photo-1563412885-139e4045ec60?w=600&h=450&fit=crop&q=80',
  almond: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&h=450&fit=crop&q=80',
  pork: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=450&fit=crop&q=80',
  heritage_pork: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=450&fit=crop&q=80',
  chicken: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=450&fit=crop&q=80',
  pasture_chicken: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&h=450&fit=crop&q=80',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=450&fit=crop&q=80',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=450&fit=crop&q=80',
  maple_syrup: 'https://images.unsplash.com/photo-1589496933738-f5c27bc146e3?w=600&h=450&fit=crop&q=80',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=450&fit=crop&q=80',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=450&fit=crop&q=80',
  citrus: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=450&fit=crop&q=80',
  nut: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=450&fit=crop&q=80',
  meat: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=450&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=450&fit=crop&q=80',
  processed: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=450&fit=crop&q=80',
}

function getProductImage(productId: string, varietyId: string, category: string): string {
  const varietyKey = varietyId.toLowerCase().replace(/-/g, '_')
  const productKey = productId.toLowerCase().replace(/-/g, '_')
  return PRODUCT_IMAGES[varietyKey] || PRODUCT_IMAGES[productKey] || PRODUCT_IMAGES[category] || PRODUCT_IMAGES.fruit
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DiscoverPage() {
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation(true)
  const filterState = useFilters()
  const [data, setData] = useState<DiscoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [locationName, setLocationName] = useState<string>(DEFAULT_LOCATION.name)
  const [zipInput, setZipInput] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)
  const [lookingUpZip, setLookingUpZip] = useState(false)
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false)

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
    if (location) return { ...location, name: locationName }
    return DEFAULT_LOCATION
  }, [location?.lat, location?.lon, manualLocation, locationName])

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
              <span className="border-b border-dashed border-stone-400 uppercase tracking-wider">
                {activeLocation.name}
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
                    className="w-full text-left px-3 py-2 font-mono text-sm text-stone-600 hover:bg-stone-100 mb-2"
                  >
                    Use my location
                  </button>
                  <div className="border-t border-stone-200 pt-2 max-h-40 overflow-y-auto">
                    {FALLBACK_CITIES.slice(0, 8).map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-3 py-1.5 font-mono text-sm text-stone-600 hover:bg-stone-100"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
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
                        <ProductCard key={item.id} item={item} status="peak" />
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
                        <ProductCard key={item.id} item={item} status="season" />
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
                        <ProductCard key={item.id} item={item} status="approaching" />
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
                        <ProductCard key={item.id} item={item} status="off" />
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

function ProductCard({ item, status }: { item: DiscoveryItem; status: 'peak' | 'season' | 'approaching' | 'off' }) {
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
          <div className="flex">
            <dt className="w-16 uppercase tracking-wide">Distance</dt>
            <dd className="text-stone-700">{item.distanceMiles} mi</dd>
          </div>
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
