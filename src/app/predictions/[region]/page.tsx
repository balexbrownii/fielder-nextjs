/**
 * Region Predictions Page
 *
 * Shows all product predictions for a specific region
 * URL: /predictions/[region-slug] (e.g., /predictions/vero-beach-fl)
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Header } from '@/components/Header'
import {
  ALL_GROWING_REGIONS,
  getRegionBySlug,
} from '@/lib/constants/growing-regions'
import {
  OFFERINGS_BY_REGION,
  CULTIVARS_BY_ID,
  PRODUCTS_BY_ID,
  type RegionalOffering,
} from '@/lib/constants/products'

interface Props {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) return { title: 'Region Not Found' }

  return {
    title: `Fresh Produce in ${region.displayName} | Fielder`,
    description: `Real-time harvest predictions for ${region.displayName}, ${region.state}. See what's at peak freshness: ${region.primaryProducts.slice(0, 5).join(', ')}.`,
    openGraph: {
      title: `Fresh Produce in ${region.displayName}`,
      description: `What's fresh and in season in ${region.displayName}, ${region.state}`,
    },
  }
}

export async function generateStaticParams() {
  return Object.values(ALL_GROWING_REGIONS).map((region) => ({
    region: region.slug,
  }))
}

function getProductSlug(cultivarId: string): string {
  // Convert cultivar ID to URL-friendly slug
  return cultivarId.replace(/_/g, '-').toLowerCase()
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

function ProductCard({ offering, regionSlug }: { offering: RegionalOffering; regionSlug: string }) {
  const cultivar = CULTIVARS_BY_ID[offering.varietyId || '']
  const product = cultivar ? PRODUCTS_BY_ID[cultivar.productId] : null
  if (!cultivar || !product) return null

  const productSlug = getProductSlug(cultivar.id)
  const gradient = categoryGradients[product.category] || categoryGradients.fruit

  return (
    <Link
      href={`/predictions/${regionSlug}/${productSlug}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-lg hover:ring-stone-300 active:scale-[0.98]"
    >
      {/* Placeholder image area */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient}`}>
        {/* Quality badge */}
        {offering.qualityTier && (
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${
                offering.qualityTier === 'exceptional'
                  ? 'bg-purple-500'
                  : offering.qualityTier === 'excellent'
                    ? 'bg-[var(--color-peak)]'
                    : 'bg-stone-500'
              }`}
            >
              {offering.qualityTier}
            </span>
          </div>
        )}

        {/* Category label */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-600 backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {cultivar.displayName}
        </h3>
        <p className="text-sm text-stone-500 mt-0.5">{product.displayName}</p>

        {cultivar.flavorProfile && (
          <p className="mt-3 text-sm text-stone-600 line-clamp-2">{cultivar.flavorProfile}</p>
        )}

        {offering.flavorNotes && (
          <p className="mt-2 text-sm italic text-stone-500 line-clamp-1">
            {offering.flavorNotes}
          </p>
        )}

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cultivar.isHeritage && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              Heritage
            </span>
          )}
          {cultivar.isNonGmo && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              Non-GMO
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function RegionPage({ params }: Props) {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)

  if (!region) {
    notFound()
  }

  const offerings = OFFERINGS_BY_REGION[region.id] || []
  const activeOfferings = offerings.filter((o) => o.isActive)

  // Group by category
  const offeringsByCategory = activeOfferings.reduce(
    (acc, offering) => {
      const cultivar = CULTIVARS_BY_ID[offering.varietyId || '']
      const product = cultivar ? PRODUCTS_BY_ID[cultivar.productId] : null
      if (!product) return acc
      const category = product.category
      if (!acc[category]) acc[category] = []
      acc[category].push(offering)
      return acc
    },
    {} as Record<string, RegionalOffering[]>
  )

  const categoryOrder = [
    'fruit',
    'vegetable',
    'nut',
    'meat',
    'dairy',
    'honey',
    'processed',
  ]
  const categoryLabels: Record<string, string> = {
    fruit: 'Fruits',
    vegetable: 'Vegetables',
    nut: 'Nuts',
    meat: 'Meat & Poultry',
    dairy: 'Dairy & Eggs',
    honey: 'Honey',
    processed: 'Lightly Processed',
  }

  const categoryIcons: Record<string, string> = {
    fruit: '🍎',
    vegetable: '🥬',
    nut: '🥜',
    meat: '🥩',
    dairy: '🥚',
    honey: '🍯',
    processed: '🫙',
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/predictions" className="hover:text-[var(--color-accent)] transition-colors">
            Regions
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-stone-900 font-medium">{region.displayName}</span>
        </nav>

        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {region.displayName}
          </h1>
          <p className="mt-3 text-lg text-stone-600">
            {region.state} &bull; {region.primaryCities.join(', ')}
          </p>

          {/* Climate badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full bg-[var(--color-peak-light)] px-4 py-2">
              <span className="text-sm font-medium text-[var(--color-peak)]">
                {region.climate.frostFreeDays} frost-free days
              </span>
            </div>
            {region.climate.usdaZone && (
              <div className="rounded-full bg-blue-50 px-4 py-2">
                <span className="text-sm font-medium text-blue-700">
                  USDA Zone {region.climate.usdaZone}
                </span>
              </div>
            )}
            {region.climate.annualGdd50 && (
              <div className="rounded-full bg-[var(--color-approaching-light)] px-4 py-2">
                <span className="text-sm font-medium text-[var(--color-approaching)]">
                  {region.climate.annualGdd50.toLocaleString()} GDD/year
                </span>
              </div>
            )}
          </div>

          {region.notes && (
            <p className="mt-6 text-stone-600 max-w-3xl">{region.notes}</p>
          )}
        </div>

        {/* Products */}
        {activeOfferings.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-stone-200/50">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
              Coming Soon
            </h3>
            <p className="mt-2 text-stone-600">
              No products currently tracked for this region.
            </p>
            <p className="mt-4 text-sm text-stone-500">
              Primary products: {region.primaryProducts.join(', ')}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categoryOrder.map((category) => {
              const categoryOfferings = offeringsByCategory[category]
              if (!categoryOfferings || categoryOfferings.length === 0) return null

              return (
                <section key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{categoryIcons[category]}</span>
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                        {categoryLabels[category] || category}
                      </h2>
                      <p className="text-sm text-stone-500">
                        {categoryOfferings.length} {categoryOfferings.length === 1 ? 'variety' : 'varieties'}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryOfferings.map((offering) => (
                      <ProductCard key={offering.id} offering={offering} regionSlug={region.slug} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* Region Details */}
        <section className="mt-16 rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-stone-200/50">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
            Region Details
          </h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-stone-500">Counties</dt>
              <dd className="mt-1 text-stone-900">
                {region.counties.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500">Coordinates</dt>
              <dd className="mt-1 text-stone-900">
                {region.latitude.toFixed(2)}°N, {Math.abs(region.longitude).toFixed(2)}°W
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-stone-500">Growing Season</dt>
              <dd className="mt-1 text-stone-900">
                Day {region.climate.avgLastFrostDoy} – Day{' '}
                {region.climate.avgFirstFrostDoy}
              </dd>
            </div>
            {region.climate.avgChillHours && (
              <div>
                <dt className="text-sm font-medium text-stone-500">Chill Hours</dt>
                <dd className="mt-1 text-stone-900">
                  {region.climate.avgChillHours} hours/winter
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <Link
            href={`/discover?lat=${region.latitude}&lon=${region.longitude}`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[var(--color-accent-dark)] hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
          >
            View Live Status Near {region.displayName}
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}
