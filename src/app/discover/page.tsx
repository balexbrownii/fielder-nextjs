'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useGeolocation, FALLBACK_CITIES } from '@/lib/hooks/useGeolocation'
import { useFilters } from '@/lib/hooks/useFilters'
import { FilterSidebar } from '@/components/FilterSidebar'
import { formatDistance } from '@/lib/utils/distance'

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

export default function DiscoverPage() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation(true)
  const filterState = useFilters()
  const [data, setData] = useState<DiscoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const activeLocation = useMemo(() => {
    if (manualLocation) return manualLocation
    if (location) return { ...location, name: 'your location' }
    return null
  }, [manualLocation, location?.lat, location?.lon])

  // Fetch discovery data when location or filters change
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

  // Show location picker if geo denied
  useEffect(() => {
    if (geoError && !manualLocation) {
      setShowLocationPicker(true)
    }
  }, [geoError, manualLocation])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-800">
              Fielder
            </Link>
            <nav className="flex gap-2">
              <Link
                href="/farm"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                For Farms
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            What&apos;s Fresh Near You
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover local harvests at their peak, sorted by distance
          </p>

          {/* Location indicator */}
          {activeLocation && !showLocationPicker && (
            <button
              onClick={() => setShowLocationPicker(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-200 transition-colors"
            >
              <LocationIcon className="h-4 w-4" />
              Near {manualLocation?.name || 'your location'}
              <ChevronDownIcon className="h-4 w-4 text-green-600" />
            </button>
          )}
        </div>

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {geoError ? 'Select your location' : 'Change location'}
            </h3>
            {geoError && (
              <p className="text-sm text-gray-500 mb-4">
                Location access was denied. Choose a city near you:
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FALLBACK_CITIES.map(city => (
                <button
                  key={city.name}
                  onClick={() => {
                    setManualLocation({ lat: city.lat, lon: city.lon, name: city.name })
                    setShowLocationPicker(false)
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{city.name}</span>
                </button>
              ))}
            </div>
            {!geoError && (
              <button
                onClick={() => setShowLocationPicker(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filterState={filterState}
            categoryCounts={data?.categoryCounts || {}}
          />

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Loading State */}
            {(geoLoading || loading) && !showLocationPicker && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
                <p className="mt-4 text-gray-600">
                  {geoLoading ? 'Finding your location...' : 'Loading fresh harvests...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-2xl bg-red-50 p-6 text-center">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <>
                {/* Results summary */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {data.totalResults} items found
                    {data.source === 'computed' && (
                      <span className="ml-2 text-xs text-amber-600">(computed)</span>
                    )}
                  </p>
                </div>

                {/* At Peak Now */}
                {data.atPeak.length > 0 && (
                  <ResultSection
                    title="At Peak Now"
                    subtitle={`${data.atPeak.length} harvests at perfect ripeness`}
                    icon="sparkles"
                    iconBg="bg-green-100"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {data.atPeak.map((item) => (
                        <ProductCard key={item.id} item={item} isPeak />
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* In Season */}
                {data.inSeason.length > 0 && (
                  <ResultSection
                    title="In Season"
                    subtitle={`${data.inSeason.length} items available now`}
                    icon="check"
                    iconBg="bg-emerald-100"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {data.inSeason.map((item) => (
                        <ProductCard key={item.id} item={item} />
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Coming Soon */}
                {data.approaching.length > 0 && (
                  <ResultSection
                    title="Coming Soon"
                    subtitle="Ready in the next few weeks"
                    icon="clock"
                    iconBg="bg-amber-100"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {data.approaching.map((item) => (
                        <ComingSoonCard key={item.id} item={item} />
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Off Season */}
                {data.offSeason.length > 0 && filterState.filters.status.includes('off_season') && (
                  <ResultSection
                    title="Off Season"
                    subtitle={`${data.offSeason.length} items not currently available`}
                    icon="moon"
                    iconBg="bg-gray-100"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {data.offSeason.map((item) => (
                        <OffSeasonCard key={item.id} item={item} />
                      ))}
                    </div>
                  </ResultSection>
                )}

                {/* Empty State */}
                {data.totalResults === 0 && (
                  <div className="rounded-2xl bg-gray-50 p-12 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900">No results found</h3>
                    <p className="mt-2 text-gray-600">
                      Try adjusting your filters or expanding your search area.
                    </p>
                    <button
                      onClick={() => filterState.resetFilters()}
                      className="mt-4 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

interface ResultSectionProps {
  title: string
  subtitle: string
  icon: 'sparkles' | 'check' | 'clock' | 'moon'
  iconBg: string
  children: React.ReactNode
}

function ResultSection({ title, subtitle, icon, iconBg, children }: ResultSectionProps) {
  const icons = {
    sparkles: '✨',
    check: '🌟',
    clock: '🌱',
    moon: '🌙',
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
          <span className="text-xl">{icons[icon]}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function ProductCard({ item, isPeak }: { item: DiscoveryItem; isPeak?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md ${
        isPeak ? 'ring-2 ring-green-500' : 'ring-1 ring-gray-200'
      }`}
    >
      {/* Peak badge */}
      {isPeak && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
            <span>✨</span> AT PEAK
          </span>
        </div>
      )}

      {/* Category badge */}
      <div className="absolute top-4 left-4">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {item.subcategory.replace('_', ' ')}
        </span>
      </div>

      {/* Product name */}
      <h3 className="mt-4 text-xl font-bold text-gray-900 pr-20">
        {item.varietyDisplayName}
      </h3>
      <p className="text-sm text-gray-500">{item.productDisplayName}</p>

      {/* Location & Distance */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <LocationIcon className="h-4 w-4 text-gray-400" />
        <span>{item.regionDisplayName}, {item.state}</span>
        <span className="text-gray-300">·</span>
        <span className="font-medium text-green-700">{formatDistance(item.distanceMiles)}</span>
      </div>

      {/* Status message */}
      {item.statusMessage && (
        <p className="mt-3 text-sm text-gray-600">{item.statusMessage}</p>
      )}

      {/* Harvest window */}
      {item.harvestStart && item.harvestEnd && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Harvest Window</span>
            <span className="font-medium text-gray-900">
              {formatDate(item.harvestStart)} – {formatDate(item.harvestEnd)}
            </span>
          </div>
          {item.optimalStart && item.optimalEnd && (
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-gray-500">Peak Quality</span>
              <span className="font-medium text-green-700">
                {formatDate(item.optimalStart)} – {formatDate(item.optimalEnd)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quality indicators */}
      {item.brix && (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>Brix: {item.brix}°</span>
          {item.brixAcidRatio && <span>Ratio: {item.brixAcidRatio}:1</span>}
        </div>
      )}

      {/* Tags */}
      <div className="mt-3 flex gap-2">
        {item.isHeritage && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            Heritage
          </span>
        )}
        {item.isNonGmo && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Non-GMO
          </span>
        )}
        {item.qualityTier && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {item.qualityTier}
          </span>
        )}
      </div>
    </div>
  )
}

function ComingSoonCard({ item }: { item: DiscoveryItem }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {item.subcategory.replace('_', ' ')}
          </span>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{item.varietyDisplayName}</h3>
          <p className="text-sm text-gray-500">{item.productDisplayName}</p>
        </div>
        {item.daysUntilStart && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            ~{item.daysUntilStart} days
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <LocationIcon className="h-4 w-4 text-gray-400" />
        <span>{item.regionDisplayName}, {item.state}</span>
        <span className="text-gray-300">·</span>
        <span className="font-medium text-amber-700">{formatDistance(item.distanceMiles)}</span>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {item.statusMessage || `Expected harvest: ${item.harvestStart ? formatDate(item.harvestStart) : 'Soon'}`}
      </p>
    </div>
  )
}

function OffSeasonCard({ item }: { item: DiscoveryItem }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-200 opacity-75">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {item.subcategory.replace('_', ' ')}
      </span>
      <h3 className="mt-1 text-lg font-bold text-gray-700">{item.varietyDisplayName}</h3>
      <p className="text-sm text-gray-400">{item.productDisplayName}</p>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <LocationIcon className="h-4 w-4 text-gray-300" />
        <span>{item.regionDisplayName}, {item.state}</span>
        <span className="text-gray-300">·</span>
        <span>{formatDistance(item.distanceMiles)}</span>
      </div>

      <p className="mt-3 text-sm text-gray-400">
        {item.statusMessage || 'Currently off season'}
      </p>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}
