'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Region {
  id: string
  displayName: string
  state: string
  viableCrops: string[]
}

interface Prediction {
  crop: string
  region: string
  region_name: string
  status: string
  status_message: string
  harvest_start_date: string
  harvest_end_date: string
  optimal_start_date: string
  optimal_end_date: string
  current_gdd: number
  confidence: number
  sugar_acid?: {
    ssc: number
    ta: number
    ratio: number
    brimA: number
  }
}

const statusColors: Record<string, string> = {
  at_peak: 'bg-green-100 text-green-800 ring-green-600/20',
  in_season: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  approaching: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  past_peak: 'bg-orange-100 text-orange-800 ring-orange-600/20',
  pre_season: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  ended: 'bg-red-100 text-red-800 ring-red-600/20',
}

const statusLabels: Record<string, string> = {
  at_peak: 'At Peak!',
  in_season: 'In Season',
  approaching: 'Coming Soon',
  past_peak: 'Past Peak',
  pre_season: 'Off Season',
  ended: 'Season Ended',
}

export default function DiscoverPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load regions on mount
  useEffect(() => {
    fetch('/api/regions')
      .then(res => res.json())
      .then(data => {
        setRegions(data.regions)
        // Default to first region
        if (data.regions.length > 0) {
          setSelectedRegion(data.regions[0].id)
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load regions')
        setLoading(false)
      })
  }, [])

  // Load predictions when region changes
  useEffect(() => {
    if (!selectedRegion) return

    const region = regions.find(r => r.id === selectedRegion)
    if (!region) return

    setLoading(true)

    // Fetch predictions for all viable crops in the region
    Promise.all(
      region.viableCrops.map(crop =>
        fetch(`/api/predict?crop=${crop}&region=${selectedRegion}`)
          .then(res => res.json())
          .catch(() => null)
      )
    ).then(results => {
      const valid = results.filter((r): r is Prediction => r && !r.error)
      // Sort by status (at_peak first, then in_season, etc.)
      const statusOrder = ['at_peak', 'in_season', 'approaching', 'past_peak', 'pre_season', 'ended']
      valid.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
      setPredictions(valid)
      setLoading(false)
    })
  }, [selectedRegion, regions])

  const selectedRegionData = regions.find(r => r.id === selectedRegion)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-800">
              Fielder
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/discover"
                className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
              >
                Discover
              </Link>
              <Link
                href="/farm"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Farm Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Region Selector */}
        <div className="mb-8">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Select Your Region
          </label>
          <select
            id="region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="mt-2 block w-full max-w-md rounded-lg border-gray-300 bg-white py-3 pl-4 pr-10 text-base shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
          >
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.displayName}, {region.state}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
            <span className="ml-3 text-gray-600">Loading predictions...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Predictions Grid */}
        {!loading && predictions.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              What&apos;s Growing in {selectedRegionData?.displayName}
            </h2>

            {/* At Peak Section */}
            {predictions.filter(p => p.status === 'at_peak').length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-green-700">
                  <span className="mr-2">🌟</span> At Peak Now
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {predictions.filter(p => p.status === 'at_peak').map(pred => (
                    <CropCard key={pred.crop} prediction={pred} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Other Crops */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {predictions.filter(p => p.status !== 'at_peak').map(pred => (
                <CropCard key={pred.crop} prediction={pred} />
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && predictions.length === 0 && selectedRegion && (
          <div className="rounded-lg bg-gray-100 p-8 text-center">
            <p className="text-gray-600">
              No predictions available for this region yet.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function CropCard({ prediction, featured }: { prediction: Prediction; featured?: boolean }) {
  const cropName = prediction.crop.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-sm ring-1 ${
        featured ? 'ring-green-300 shadow-green-100' : 'ring-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-lg font-semibold text-gray-900">{cropName}</h4>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            statusColors[prediction.status] || statusColors.pre_season
          }`}
        >
          {statusLabels[prediction.status] || prediction.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">{prediction.status_message}</p>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Harvest Window</span>
          <span className="font-medium text-gray-900">
            {prediction.harvest_start_date} - {prediction.harvest_end_date}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Peak Quality</span>
          <span className="font-medium text-gray-900">
            {prediction.optimal_start_date} - {prediction.optimal_end_date}
          </span>
        </div>
        {prediction.sugar_acid && (
          <div className="flex justify-between">
            <span className="text-gray-500">Brix / Acidity</span>
            <span className="font-medium text-gray-900">
              {prediction.sugar_acid.ssc}° / {prediction.sugar_acid.ratio}:1
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>GDD: {prediction.current_gdd.toLocaleString()}</span>
          <span>Confidence: {Math.round(prediction.confidence * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
