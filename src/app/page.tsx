'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { useGeolocation, DEFAULT_LOCATION, FALLBACK_CITIES } from '@/lib/hooks/useGeolocation'

// Match actual API response structure
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

const SEASON_LABELS: Record<string, string> = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
}

const SEASON_MESSAGES: Record<string, string> = {
  winter: "The quiet season brings citrus to its sweetest—cold nights concentrate sugars in Florida's groves.",
  spring: "As the earth warms, tender greens and early berries emerge from fields across the South.",
  summer: "Stone fruit season is in full swing. Peaches, cherries, and melons at their sun-ripened best.",
  fall: "Harvest time. Apples crisp from the orchard, squash from the field, and the year's final bounty.",
}

export default function Home() {
  const { location: geoLocation, loading: geoLoading, error: geoError, requestLocation } = useGeolocation(true)
  const [atPeak, setAtPeak] = useState<DiscoveryItem[]>([])
  const [inSeason, setInSeason] = useState<DiscoveryItem[]>([])
  const [approaching, setApproaching] = useState<DiscoveryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSeason, setCurrentSeason] = useState<string>('winter')
  const [totalResults, setTotalResults] = useState(0)
  const [locationName, setLocationName] = useState<string | null>(DEFAULT_LOCATION.name)
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
      setTotalResults(data.totalResults || 0)
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

  // When user selects a manual location, fetch that
  useEffect(() => {
    if (manualLocation) {
      fetchDiscoveryData(manualLocation.lat, manualLocation.lon)
      setLocationName(manualLocation.name)
    }
  }, [manualLocation, fetchDiscoveryData])

  // When geolocation completes successfully, update to user's actual location
  useEffect(() => {
    if (geoLocation && !manualLocation) {
      fetchDiscoveryData(geoLocation.lat, geoLocation.lon)
      // Reverse geocode to get city name
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
    setLocationName(city.name)
    setShowCityPicker(false)
  }

  const atPeakDisplay = atPeak.slice(0, 6)
  const inSeasonDisplay = inSeason.slice(0, 6)
  const approachingDisplay = approaching.slice(0, 4)

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />

      {/* Hero - Seasonal Lead */}
      <section className="relative pt-8 pb-4 sm:pt-12 sm:pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Season & Location */}
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-2">
              {SEASON_LABELS[currentSeason] || 'Winter'} Harvest
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-tight">
              What&apos;s fresh{' '}
              <button
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="inline-flex items-center gap-1.5 text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] transition-colors underline decoration-dotted underline-offset-4"
              >
                {locationName || 'near you'}
                <LocationIcon className="h-5 w-5 flex-shrink-0" />
              </button>
            </h1>
            <p className="mt-4 text-lg text-stone-600 leading-relaxed max-w-2xl">
              {SEASON_MESSAGES[currentSeason] || SEASON_MESSAGES.winter}
            </p>
          </div>

          {/* City Picker Dropdown */}
          {showCityPicker && (
            <div className="mt-4 p-4 bg-white rounded-xl shadow-lg ring-1 ring-stone-200/50 max-w-md">
              <p className="text-sm font-medium text-stone-700 mb-3">Choose a location:</p>
              <div className="grid grid-cols-2 gap-2">
                {FALLBACK_CITIES.slice(0, 10).map(city => (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className="text-left px-3 py-2 text-sm rounded-lg hover:bg-stone-100 transition-colors text-stone-700"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
              {geoError && (
                <button
                  onClick={() => { requestLocation(); setShowCityPicker(false) }}
                  className="mt-3 w-full text-center text-sm text-[var(--color-accent)] hover:underline"
                >
                  Try location again
                </button>
              )}
            </div>
          )}

          {/* Quick Stats */}
          {!loading && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {atPeak.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[var(--color-peak)]">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {atPeak.length} at peak
                </span>
              )}
              {inSeason.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[var(--color-season)]">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {inSeason.length} in season
                </span>
              )}
              {approaching.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[var(--color-approaching)]">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {approaching.length} coming soon
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchDiscoveryData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)} />
        ) : (
          <div className="space-y-12">
            {/* At Peak Section */}
            {atPeakDisplay.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-peak)]" />
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                      At Peak Now
                    </h2>
                  </div>
                  {atPeak.length > 6 && (
                    <Link href="/discover?status=at_peak" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                      See all {atPeak.length}
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {atPeakDisplay.map(item => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* In Season Section */}
            {inSeasonDisplay.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-season)]" />
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                      In Season
                    </h2>
                  </div>
                  {inSeason.length > 6 && (
                    <Link href="/discover?status=in_season" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                      See all {inSeason.length}
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {inSeasonDisplay.map(item => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Coming Soon Section */}
            {approachingDisplay.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-approaching)]" />
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                      Coming Soon
                    </h2>
                  </div>
                  {approaching.length > 4 && (
                    <Link href="/discover?status=approaching" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                      See all {approaching.length}
                    </Link>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {approachingDisplay.map(item => (
                    <ProductCardCompact key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {totalResults === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-stone-600">No produce data available for this location yet.</p>
                <Link href="/predictions" className="mt-4 inline-block text-[var(--color-accent)] hover:underline">
                  Browse by region instead
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Explore More */}
        {!loading && totalResults > 0 && (
          <section className="mt-16 pt-12 border-t border-stone-200">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                Explore More
              </h2>
              <p className="mt-2 text-stone-600">
                Browse all growing regions or filter by what you&apos;re looking for.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-accent-dark)] active:scale-[0.98]"
                >
                  Advanced Search
                </Link>
                <Link
                  href="/predictions"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-stone-900 shadow-sm ring-1 ring-stone-200 transition-all hover:bg-stone-50 active:scale-[0.98]"
                >
                  Browse by Region
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Fielder
              </span>
              <p className="mt-2 text-sm text-stone-500">
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
              <Link href="/about" className="text-sm text-stone-400 hover:text-white transition-colors">
                About
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
  const href = `/predictions/${item.regionId.replace(/_/g, '-').toLowerCase()}/${item.varietyId.replace(/_/g, '-').toLowerCase()}`

  return (
    <Link
      href={href}
      className="group block bg-white rounded-xl p-5 shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-md hover:ring-stone-300 active:scale-[0.99]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors truncate">
            {item.varietyDisplayName}
          </h3>
          <p className="text-sm text-stone-500 truncate">
            {item.productDisplayName}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Flavor Profile */}
      {item.flavorProfile && (
        <p className="mt-3 text-sm text-stone-600 line-clamp-2">
          {item.flavorProfile}
        </p>
      )}

      {/* Region & Distance */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-stone-500 truncate">
          {item.regionDisplayName}, {item.state}
        </span>
        <span className="text-stone-400 flex-shrink-0 ml-2">
          {item.distanceMiles} mi
        </span>
      </div>

      {/* Harvest Window */}
      {item.harvestStart && (
        <p className="mt-2 text-xs text-stone-400">
          Harvest: {formatDate(item.harvestStart)} – {formatDate(item.harvestEnd)}
        </p>
      )}
    </Link>
  )
}

function ProductCardCompact({ item }: { item: DiscoveryItem }) {
  const href = `/predictions/${item.regionId.replace(/_/g, '-').toLowerCase()}/${item.varietyId.replace(/_/g, '-').toLowerCase()}`

  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg p-4 shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-md hover:ring-stone-300 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <StatusDot status={item.status} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 group-hover:text-[var(--color-accent)] transition-colors truncate text-sm">
            {item.varietyDisplayName}
          </h3>
          <p className="text-xs text-stone-500 truncate">
            {item.regionDisplayName} &bull; {item.distanceMiles} mi
          </p>
        </div>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    at_peak: 'bg-[var(--color-peak-light)] text-[var(--color-peak)]',
    in_season: 'bg-[var(--color-season-light)] text-[var(--color-season)]',
    approaching: 'bg-[var(--color-approaching-light)] text-[var(--color-approaching)]',
    off_season: 'bg-stone-100 text-stone-500',
  }

  const labels: Record<string, string> = {
    at_peak: 'Peak',
    in_season: 'In Season',
    approaching: 'Soon',
    off_season: 'Off Season',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.off_season}`}>
      {labels[status] || 'Unknown'}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    at_peak: 'bg-[var(--color-peak)]',
    in_season: 'bg-[var(--color-season)]',
    approaching: 'bg-[var(--color-approaching)]',
    off_season: 'bg-stone-400',
  }

  return <span className={`h-2 w-2 rounded-full flex-shrink-0 ${colors[status] || colors.off_season}`} />
}

function LoadingState() {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-3 w-3 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-7 w-32 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-stone-200/50 animate-pulse">
              <div className="h-5 w-3/4 bg-stone-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-stone-100 rounded mb-4" />
              <div className="h-4 w-full bg-stone-100 rounded mb-2" />
              <div className="h-3 w-1/3 bg-stone-100 rounded" />
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
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-accent-dark)]"
      >
        Try Again
      </button>
    </div>
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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
