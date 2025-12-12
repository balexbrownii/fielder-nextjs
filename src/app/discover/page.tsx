'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { useGeolocation, DEFAULT_LOCATION } from '@/lib/hooks/useGeolocation'
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

// Category colors for placeholder images
const categoryGradients: Record<string, string> = {
  fruit: 'from-red-100 to-orange-100',
  vegetable: 'from-green-100 to-emerald-100',
  nut: 'from-amber-100 to-yellow-100',
  meat: 'from-rose-100 to-red-100',
  dairy: 'from-blue-100 to-sky-100',
  honey: 'from-yellow-100 to-amber-100',
  processed: 'from-stone-100 to-stone-200',
}

export default function DiscoverPage() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation(true)
  const filterState = useFilters()
  const [data, setData] = useState<DiscoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use actual location, or fall back to default (Orlando, FL) if geo denied
  const activeLocation = useMemo(() => {
    if (location) return { ...location, name: 'your location' }
    if (geoError) return DEFAULT_LOCATION
    return null
  }, [location?.lat, location?.lon, geoError])

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

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            What&apos;s Fresh Near You
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Discover local harvests at their peak, sorted by distance
          </p>

          {/* Location indicator */}
          {activeLocation && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm ring-1 ring-stone-200/50">
              <LocationIcon className="h-4 w-4 text-[var(--color-accent)]" />
              {activeLocation.name === 'your location' ? 'Near your location' : `Showing results for ${activeLocation.name}`}
            </div>
          )}
        </div>

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
            {(geoLoading || loading) && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-[var(--color-accent)]" />
                <p className="mt-4 text-stone-600">
                  {geoLoading ? 'Finding your location...' : 'Loading fresh harvests...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-100">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-full bg-red-100 px-6 py-2.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors active:scale-[0.98]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <>
                {/* Results summary */}
                <div className="mb-8 flex items-center justify-between">
                  <p className="text-sm text-stone-500">
                    {data.totalResults} items found
                  </p>
                </div>

                {/* At Peak Now */}
                {data.atPeak.length > 0 && (
                  <ResultSection
                    title="At Peak Now"
                    subtitle={`${data.atPeak.length} harvests at perfect ripeness`}
                    status="peak"
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
                    status="season"
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
                    status="approaching"
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
                    status="off"
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
                  <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-stone-200/50">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">No results found</h3>
                    <p className="mt-2 text-stone-600">
                      Try adjusting your filters or expanding your search area.
                    </p>
                    <button
                      onClick={() => filterState.resetFilters()}
                      className="mt-6 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--color-accent-dark)] transition-all active:scale-[0.98]"
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
  status: 'peak' | 'season' | 'approaching' | 'off'
  children: React.ReactNode
}

function ResultSection({ title, subtitle, status, children }: ResultSectionProps) {
  const statusConfig = {
    peak: { bg: 'bg-[var(--color-peak-light)]', text: 'text-[var(--color-peak)]', dot: 'bg-[var(--color-peak)]' },
    season: { bg: 'bg-[var(--color-season-light)]', text: 'text-[var(--color-season)]', dot: 'bg-[var(--color-season)]' },
    approaching: { bg: 'bg-[var(--color-approaching-light)]', text: 'text-[var(--color-approaching)]', dot: 'bg-[var(--color-approaching)]' },
    off: { bg: 'bg-[var(--color-off-light)]', text: 'text-[var(--color-off)]', dot: 'bg-[var(--color-off)]' },
  }

  const config = statusConfig[status]

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bg}`}>
          <span className={`h-3 w-3 rounded-full ${config.dot}`} />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">{title}</h2>
          <p className="text-sm text-stone-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function ProductCard({ item, isPeak }: { item: DiscoveryItem; isPeak?: boolean }) {
  const gradient = categoryGradients[item.category] || categoryGradients.fruit

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg active:scale-[0.98] ${
        isPeak ? 'ring-2 ring-[var(--color-peak)]' : 'ring-1 ring-stone-200/50 hover:ring-stone-300'
      }`}
    >
      {/* Placeholder image area */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient}`}>
        {/* Peak badge */}
        {isPeak && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-peak)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              AT PEAK
            </span>
          </div>
        )}

        {/* Category label */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-600 backdrop-blur-sm">
            {item.subcategory.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Product name */}
        <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {item.varietyDisplayName}
        </h3>
        <p className="text-sm text-stone-500 mt-0.5">{item.productDisplayName}</p>

        {/* Location & Distance */}
        <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
          <LocationIcon className="h-4 w-4 text-stone-400" />
          <span>{item.regionDisplayName}, {item.state}</span>
          <span className="text-stone-300">·</span>
          <span className={`font-medium ${isPeak ? 'text-[var(--color-peak)]' : 'text-[var(--color-accent)]'}`}>
            {formatDistance(item.distanceMiles)}
          </span>
        </div>

        {/* Status message */}
        {item.statusMessage && (
          <p className="mt-3 text-sm text-stone-600 line-clamp-2">{item.statusMessage}</p>
        )}

        {/* Harvest window */}
        {item.harvestStart && item.harvestEnd && (
          <div className="mt-4 rounded-xl bg-stone-50 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Harvest</span>
              <span className="font-medium text-stone-700">
                {formatDate(item.harvestStart)} – {formatDate(item.harvestEnd)}
              </span>
            </div>
            {item.optimalStart && item.optimalEnd && (
              <div className="mt-1.5 flex justify-between text-sm">
                <span className="text-stone-500">Peak</span>
                <span className="font-medium text-[var(--color-peak)]">
                  {formatDate(item.optimalStart)} – {formatDate(item.optimalEnd)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quality indicators */}
        {item.brix && (
          <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <span className="font-medium text-stone-700">Brix:</span> {item.brix}°
            </span>
            {item.brixAcidRatio && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-stone-700">Ratio:</span> {item.brixAcidRatio}:1
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {(item.isHeritage || item.isNonGmo || item.qualityTier) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
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
        )}
      </div>
    </div>
  )
}

function ComingSoonCard({ item }: { item: DiscoveryItem }) {
  const gradient = categoryGradients[item.category] || categoryGradients.fruit

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-md hover:ring-stone-300 active:scale-[0.98]">
      {/* Placeholder image area */}
      <div className={`relative h-24 bg-gradient-to-br ${gradient} opacity-60`}>
        {item.daysUntilStart && (
          <div className="absolute top-3 right-3">
            <span className="rounded-full bg-[var(--color-approaching)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              ~{item.daysUntilStart} days
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-600 backdrop-blur-sm">
            {item.subcategory.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {item.varietyDisplayName}
        </h3>
        <p className="text-sm text-stone-500 mt-0.5">{item.productDisplayName}</p>

        <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
          <LocationIcon className="h-4 w-4 text-stone-400" />
          <span>{item.regionDisplayName}, {item.state}</span>
          <span className="text-stone-300">·</span>
          <span className="font-medium text-[var(--color-approaching)]">{formatDistance(item.distanceMiles)}</span>
        </div>

        <p className="mt-3 text-sm text-stone-500">
          {item.statusMessage || `Expected harvest: ${item.harvestStart ? formatDate(item.harvestStart) : 'Soon'}`}
        </p>
      </div>
    </div>
  )
}

function OffSeasonCard({ item }: { item: DiscoveryItem }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-5 ring-1 ring-stone-200/50 opacity-60">
      <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
        {item.subcategory.replace('_', ' ')}
      </span>
      <h3 className="mt-1 font-semibold text-stone-600">{item.varietyDisplayName}</h3>
      <p className="text-sm text-stone-400">{item.productDisplayName}</p>

      <div className="mt-3 flex items-center gap-2 text-sm text-stone-400">
        <LocationIcon className="h-4 w-4 text-stone-300" />
        <span>{item.regionDisplayName}, {item.state}</span>
        <span className="text-stone-300">·</span>
        <span>{formatDistance(item.distanceMiles)}</span>
      </div>

      <p className="mt-3 text-sm text-stone-400">
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
