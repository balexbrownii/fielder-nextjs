/**
 * Product Prediction Detail Page
 *
 * SEO-optimized product page with Schema.org Product markup
 * URL: /predictions/[region]/[product] (e.g., /predictions/vero-beach-fl/navel-orange)
 *
 * This is the primary page for Google Shopping / AI indexing
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { Header } from '@/components/Header'
import {
  ALL_GROWING_REGIONS,
  getRegionBySlug,
  type GrowingRegionExtended,
} from '@/lib/constants/growing-regions'
import {
  REGIONAL_OFFERINGS,
  CULTIVARS_BY_ID,
  PRODUCTS_BY_ID,
  getOfferingDetails,
  type RegionalOffering,
  type Cultivar,
  type Product,
} from '@/lib/constants/products'

interface Props {
  params: Promise<{ region: string; product: string }>
}

function getProductSlug(cultivarId: string): string {
  return cultivarId.replace(/_/g, '-').toLowerCase()
}

function getCultivarFromSlug(slug: string): Cultivar | undefined {
  const normalizedSlug = slug.replace(/-/g, '_').toLowerCase()
  return CULTIVARS_BY_ID[normalizedSlug]
}

function findOffering(
  regionId: string,
  cultivarId: string
): RegionalOffering | undefined {
  return REGIONAL_OFFERINGS.find(
    (o) => o.regionId === regionId && o.varietyId === cultivarId && o.isActive
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: regionSlug, product: productSlug } = await params

  const region = getRegionBySlug(regionSlug)
  const cultivar = getCultivarFromSlug(productSlug)
  if (!region || !cultivar) return { title: 'Product Not Found' }

  const product = PRODUCTS_BY_ID[cultivar.productId]
  if (!product) return { title: 'Product Not Found' }

  const title = `${cultivar.displayName} from ${region.displayName} | Fielder`
  const description = `Fresh ${cultivar.displayName} harvest predictions for ${region.displayName}, ${region.state}. ${cultivar.flavorProfile || product.description || ''}`

  return {
    title,
    description,
    openGraph: {
      title: `${cultivar.displayName} from ${region.displayName}`,
      description,
      type: 'website',
    },
  }
}

export async function generateStaticParams() {
  const params: { region: string; product: string }[] = []

  for (const offering of REGIONAL_OFFERINGS) {
    if (!offering.isActive) continue

    const region = ALL_GROWING_REGIONS[offering.regionId]
    const cultivar = CULTIVARS_BY_ID[offering.varietyId || '']

    if (region && cultivar) {
      params.push({
        region: region.slug,
        product: getProductSlug(cultivar.id),
      })
    }
  }

  return params
}

function ProductSchema({
  cultivar,
  product,
  region,
  offering,
}: {
  cultivar: Cultivar
  product: Product
  region: GrowingRegionExtended
  offering: RegionalOffering
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${cultivar.displayName} from ${region.displayName}`,
    description:
      cultivar.flavorProfile ||
      `Fresh ${cultivar.displayName} from ${region.displayName}, ${region.state}`,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: region.displayName,
    },
    // Geographical indication
    isAccessoryOrSparePartFor: {
      '@type': 'Place',
      name: region.displayName,
      address: {
        '@type': 'PostalAddress',
        addressRegion: region.state,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: region.latitude,
        longitude: region.longitude,
      },
    },
    // Product attributes
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Product Type',
        value: product.displayName,
      },
      {
        '@type': 'PropertyValue',
        name: 'Cultivar',
        value: cultivar.displayName,
      },
      {
        '@type': 'PropertyValue',
        name: 'Growing Region',
        value: region.displayName,
      },
      ...(offering.qualityTier
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Quality Tier',
              value: offering.qualityTier,
            },
          ]
        : []),
      ...(cultivar.isHeritage
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Heritage Variety',
              value: 'true',
            },
          ]
        : []),
      ...(cultivar.isNonGmo
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Non-GMO',
              value: 'true',
            },
          ]
        : []),
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
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

export default async function ProductPredictionPage({ params }: Props) {
  const { region: regionSlug, product: productSlug } = await params

  const region = getRegionBySlug(regionSlug)
  const cultivar = getCultivarFromSlug(productSlug)

  if (!region || !cultivar) {
    notFound()
  }

  const product = PRODUCTS_BY_ID[cultivar.productId]
  if (!product) {
    notFound()
  }

  const offering = findOffering(region.id, cultivar.id)
  if (!offering) {
    // Product exists but not offered in this region
    notFound()
  }

  const details = getOfferingDetails(offering.id)
  const gradient = categoryGradients[product.category] || categoryGradients.fruit

  return (
    <>
      <ProductSchema
        cultivar={cultivar}
        product={product}
        region={region}
        offering={offering}
      />

      <div className="min-h-screen bg-[var(--color-cream)]">
        <Header />

        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-stone-500">
            <Link href="/predictions" className="hover:text-[var(--color-accent)] transition-colors">
              Regions
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link
              href={`/predictions/${region.slug}`}
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {region.displayName}
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-stone-900 font-medium">{cultivar.displayName}</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50">
            {/* Gradient header */}
            <div className={`h-32 sm:h-40 bg-gradient-to-br ${gradient}`} />

            {/* Content */}
            <div className="p-6 sm:p-8 -mt-8 relative">
              {/* Badges */}
              <div className="absolute top-0 right-6 sm:right-8 flex flex-wrap gap-2 -translate-y-1/2">
                {offering.qualityTier && (
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-lg ${
                      offering.qualityTier === 'exceptional'
                        ? 'bg-purple-500'
                        : offering.qualityTier === 'excellent'
                          ? 'bg-[var(--color-peak)]'
                          : 'bg-stone-500'
                    }`}
                  >
                    {offering.qualityTier}
                  </span>
                )}
                {cultivar.isHeritage && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 text-sm font-bold text-purple-700 shadow-lg ring-1 ring-purple-200">
                    Heritage
                  </span>
                )}
                {cultivar.isNonGmo && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-700 shadow-lg ring-1 ring-blue-200">
                    Non-GMO
                  </span>
                )}
              </div>

              <div className="pt-4">
                <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                  {cultivar.displayName}
                </h1>
                <p className="mt-2 text-lg text-stone-600">{product.displayName}</p>
                <p className="mt-3 text-stone-700">
                  from <span className="font-semibold">{region.displayName}</span>, {region.state}
                </p>

                {cultivar.flavorProfile && (
                  <p className="mt-6 text-lg text-stone-700 leading-relaxed">{cultivar.flavorProfile}</p>
                )}
                {offering.flavorNotes && (
                  <p className="mt-3 text-stone-600 italic">{offering.flavorNotes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Prediction Status */}
          <section className="mb-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-stone-200/50">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
              Harvest Prediction
            </h2>
            <p className="mt-2 text-stone-600">
              Real-time harvest predictions are computed based on Growing Degree
              Days (GDD) accumulated in {region.displayName}.
            </p>

            {details && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {details.gddToMaturity && (
                  <div className="rounded-xl bg-stone-50 p-5">
                    <p className="text-sm font-medium text-stone-500">GDD to Maturity</p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900">
                      {details.gddToMaturity.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      Base {details.baseTemp || 50}°F
                    </p>
                  </div>
                )}
                {details.gddWindow && (
                  <div className="rounded-xl bg-stone-50 p-5">
                    <p className="text-sm font-medium text-stone-500">Harvest Window</p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900">
                      {details.gddWindow}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">GDD optimal range</p>
                  </div>
                )}
                {details.peakMonths && details.peakMonths.length > 0 && (
                  <div className="rounded-xl bg-stone-50 p-5">
                    <p className="text-sm font-medium text-stone-500">Peak Months</p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
                      {details.peakMonths
                        .map((m) =>
                          new Date(2024, m - 1, 1).toLocaleString('en', {
                            month: 'short',
                          })
                        )
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <Link
                href={`/discover?lat=${region.latitude}&lon=${region.longitude}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[var(--color-accent-dark)] hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
              >
                View Live Status
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Region Info */}
          <section className="mb-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-stone-200/50">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
              About {region.displayName}
            </h2>
            {region.notes && (
              <p className="mt-3 text-stone-600">{region.notes}</p>
            )}

            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-stone-500">Location</dt>
                <dd className="mt-1 text-stone-900">
                  {region.primaryCities[0]}, {region.state}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">
                  Growing Season
                </dt>
                <dd className="mt-1 text-stone-900">
                  {region.climate.frostFreeDays} frost-free days
                </dd>
              </div>
              {region.climate.usdaZone && (
                <div>
                  <dt className="text-sm font-medium text-stone-500">USDA Zone</dt>
                  <dd className="mt-1 text-stone-900">{region.climate.usdaZone}</dd>
                </div>
              )}
              {region.climate.annualGdd50 && (
                <div>
                  <dt className="text-sm font-medium text-stone-500">
                    Annual GDD (base 50°F)
                  </dt>
                  <dd className="mt-1 text-stone-900">
                    {region.climate.annualGdd50.toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6">
              <Link
                href={`/predictions/${region.slug}`}
                className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] transition-colors"
              >
                See all products from {region.displayName} →
              </Link>
            </div>
          </section>

          {/* Product Info */}
          <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-stone-200/50">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
              About {cultivar.displayName}
            </h2>

            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-stone-500">Category</dt>
                <dd className="mt-1 text-stone-900 capitalize">{product.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Type</dt>
                <dd className="mt-1 text-stone-900 capitalize">
                  {product.subcategory.replace(/_/g, ' ')}
                </dd>
              </div>
              {cultivar.technicalName && (
                <div>
                  <dt className="text-sm font-medium text-stone-500">
                    Technical Name
                  </dt>
                  <dd className="mt-1 text-stone-900">{cultivar.technicalName}</dd>
                </div>
              )}
              {cultivar.tradeNames && cultivar.tradeNames.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-stone-500">
                    Also Known As
                  </dt>
                  <dd className="mt-1 text-stone-900">
                    {cultivar.tradeNames.join(', ')}
                  </dd>
                </div>
              )}
            </dl>

            {cultivar.nutritionNotes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-stone-500">Nutrition</h3>
                <p className="mt-2 text-stone-700">{cultivar.nutritionNotes}</p>
              </div>
            )}
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
    </>
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
