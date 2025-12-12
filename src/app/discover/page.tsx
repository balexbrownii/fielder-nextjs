'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useGeolocation, FALLBACK_CITIES } from '@/lib/hooks/useGeolocation'
import { formatDistance } from '@/lib/utils/distance'

interface DiscoveryItem {
  crop: string
  cropName: string
  region: string
  regionName: string
  state: string
  distanceMiles: number
  status: string
  statusMessage: string
  harvestStart: string
  harvestEnd: string
  optimalStart: string
  optimalEnd: string
  daysUntil?: number
  confidence: number
  sugarAcid?: {
    ssc: number
    ta: number
    ratio: number
    brimA: number
  }
}

interface DiscoveryData {
  inSeason: DiscoveryItem[]
  comingSoon: DiscoveryItem[]
}

export default function DiscoverPage() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation(true)
  const [data, setData] = useState<DiscoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const activeLocation = manualLocation || (location ? { ...location, name: 'your location' } : null)

  // Fetch discovery data when location is available
  useEffect(() => {
    if (!activeLocation) return

    setLoading(true)
    setError(null)

    fetch(`/api/discover?lat=${activeLocation.lat}&lon=${activeLocation.lon}`)
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
  }, [activeLocation])

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
        <div className="mx-auto max-w-6xl px-4 py-4">
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-10 text-center">
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
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Near {manualLocation?.name || 'your location'}
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
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
            {/* In Season Now */}
            {data.inSeason.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <span className="text-xl">🌟</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">In Season Now</h2>
                    <p className="text-sm text-gray-500">{data.inSeason.length} harvests available near you</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.inSeason.map((item, i) => (
                    <CropCard key={`${item.crop}-${item.region}`} item={item} rank={i + 1} />
                  ))}
                </div>
              </section>
            )}

            {/* Coming Soon */}
            {data.comingSoon.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-xl">🌱</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
                    <p className="text-sm text-gray-500">Ready in the next few weeks</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.comingSoon.map((item) => (
                    <ComingSoonCard key={`${item.crop}-${item.region}`} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {data.inSeason.length === 0 && data.comingSoon.length === 0 && (
              <div className="rounded-2xl bg-gray-50 p-12 text-center">
                <div className="text-5xl mb-4">🍂</div>
                <h3 className="text-xl font-semibold text-gray-900">Nothing in season right now</h3>
                <p className="mt-2 text-gray-600">
                  Check back soon as harvest seasons change throughout the year.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function CropCard({ item, rank }: { item: DiscoveryItem; rank: number }) {
  const isAtPeak = item.status === 'at_peak'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md ${
        isAtPeak ? 'ring-2 ring-green-500' : 'ring-1 ring-gray-200'
      }`}
    >
      {/* Peak badge */}
      {isAtPeak && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
            <span>✨</span> AT PEAK
          </span>
        </div>
      )}

      {/* Crop name */}
      <h3 className="text-xl font-bold text-gray-900 pr-20">{item.cropName}</h3>

      {/* Location & Distance */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span>{item.regionName}, {item.state}</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium text-green-700">{formatDistance(item.distanceMiles)}</span>
      </div>

      {/* Status message */}
      <p className="mt-3 text-sm text-gray-600">{item.statusMessage}</p>

      {/* Harvest window */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Harvest Window</span>
          <span className="font-medium text-gray-900">{item.harvestStart} – {item.harvestEnd}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-gray-500">Peak Quality</span>
          <span className="font-medium text-green-700">{item.optimalStart} – {item.optimalEnd}</span>
        </div>
      </div>

      {/* Sugar/Acid for citrus */}
      {item.sugarAcid && (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>Brix: {item.sugarAcid.ssc}°</span>
          <span>Ratio: {item.sugarAcid.ratio}:1</span>
        </div>
      )}
    </div>
  )
}

function ComingSoonCard({ item }: { item: DiscoveryItem }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-900">{item.cropName}</h3>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          ~{item.daysUntil} days
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span>{item.regionName}, {item.state}</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium text-amber-700">{formatDistance(item.distanceMiles)}</span>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Expected harvest: {item.harvestStart}
      </p>
    </div>
  )
}
