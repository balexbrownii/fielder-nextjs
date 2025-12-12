/**
 * Predictions Index - Browse by Region
 *
 * SEO-optimized listing of all agricultural regions
 * URL: /predictions
 */

import Link from 'next/link'
import { Metadata } from 'next'
import { Header } from '@/components/Header'
import {
  ALL_GROWING_REGIONS,
  getRegionsByMacroRegion,
  type MacroRegion,
  type GrowingRegionExtended,
} from '@/lib/constants/growing-regions'
import { OFFERINGS_BY_REGION } from '@/lib/constants/products'

export const metadata: Metadata = {
  title: 'Fresh Produce Predictions by Region | Fielder',
  description:
    'Real-time harvest predictions for fresh produce across the United States. Find what\'s at peak freshness near you.',
  openGraph: {
    title: 'Fresh Produce Predictions by Region',
    description:
      'Real-time harvest predictions for fresh produce across the United States.',
  },
}

const MACRO_REGION_LABELS: Record<MacroRegion, string> = {
  west_coast: 'West Coast',
  pacific_northwest: 'Pacific Northwest',
  southwest: 'Southwest',
  midwest: 'Midwest',
  southeast: 'Southeast',
  northeast: 'Northeast',
  mid_atlantic: 'Mid-Atlantic',
  mountain_west: 'Mountain West',
}

const MACRO_REGION_ORDER: MacroRegion[] = [
  'west_coast',
  'pacific_northwest',
  'southwest',
  'southeast',
  'midwest',
  'northeast',
  'mid_atlantic',
  'mountain_west',
]

const MACRO_REGION_COLORS: Record<MacroRegion, string> = {
  west_coast: 'from-orange-500 to-amber-500',
  pacific_northwest: 'from-emerald-500 to-teal-500',
  southwest: 'from-red-500 to-orange-500',
  southeast: 'from-rose-500 to-pink-500',
  midwest: 'from-amber-500 to-yellow-500',
  northeast: 'from-blue-500 to-indigo-500',
  mid_atlantic: 'from-violet-500 to-purple-500',
  mountain_west: 'from-sky-500 to-blue-500',
}

function RegionCard({ region, macroRegion }: { region: GrowingRegionExtended; macroRegion: MacroRegion }) {
  const offeringCount = OFFERINGS_BY_REGION[region.id]?.length || 0
  const gradient = MACRO_REGION_COLORS[macroRegion]

  return (
    <Link
      href={`/predictions/${region.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-lg hover:ring-stone-300 active:scale-[0.98]"
    >
      {/* Gradient header */}
      <div className={`h-16 bg-gradient-to-br ${gradient}`} />

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {region.displayName}
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          {region.state} &bull; {region.primaryCities[0]}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              region.dtcActivity === 'high'
                ? 'bg-[var(--color-peak-light)] text-[var(--color-peak)]'
                : region.dtcActivity === 'medium'
                  ? 'bg-[var(--color-approaching-light)] text-[var(--color-approaching)]'
                  : 'bg-stone-100 text-stone-500'
            }`}
          >
            {region.dtcActivity === 'high'
              ? 'High DTC Activity'
              : region.dtcActivity === 'medium'
                ? 'Medium DTC'
                : 'Low DTC'}
          </span>
          {offeringCount > 0 && (
            <span className="text-xs text-stone-400">
              {offeringCount} products
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {region.primaryProducts.slice(0, 3).map((product) => (
            <span
              key={product}
              className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600"
            >
              {product.replace(/_/g, ' ')}
            </span>
          ))}
          {region.primaryProducts.length > 3 && (
            <span className="text-xs text-stone-400">
              +{region.primaryProducts.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function PredictionsPage() {
  const totalRegions = Object.keys(ALL_GROWING_REGIONS).length

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Explore Growing Regions
          </h1>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Browse {totalRegions} agricultural regions across the United States.
            Select a region to see real-time harvest predictions.
          </p>
        </div>

        {/* Regions by Macro Region */}
        <div className="space-y-14">
          {MACRO_REGION_ORDER.map((macroRegion) => {
            const regions = getRegionsByMacroRegion(macroRegion)
            if (regions.length === 0) return null

            return (
              <section key={macroRegion}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${MACRO_REGION_COLORS[macroRegion]}`} />
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                      {MACRO_REGION_LABELS[macroRegion]}
                    </h2>
                    <p className="text-sm text-stone-500">
                      {regions.length} regions
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {regions
                    .sort((a, b) => {
                      // High DTC first, then by name
                      if (a.dtcActivity !== b.dtcActivity) {
                        const order = { high: 0, medium: 1, low: 2 }
                        return order[a.dtcActivity] - order[b.dtcActivity]
                      }
                      return a.displayName.localeCompare(b.displayName)
                    })
                    .map((region) => (
                      <RegionCard key={region.id} region={region} macroRegion={macroRegion} />
                    ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* CTA Section */}
        <section className="mt-16 rounded-2xl bg-stone-900 p-8 sm:p-12 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white sm:text-3xl">
            Know exactly what&apos;s fresh near you
          </h2>
          <p className="mt-4 text-stone-400 max-w-xl mx-auto">
            Our predictions use Growing Degree Day models to tell you precisely when produce hits peak quality.
          </p>
          <Link
            href="/discover"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold text-stone-900 transition-all hover:bg-stone-100 active:scale-[0.98]"
          >
            Discover What&apos;s Fresh
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 mt-16">
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}
