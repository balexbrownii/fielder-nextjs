/**
 * Product Prediction Detail Page
 * Vintage recipe card / notecard aesthetic
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
import { getProductImage } from '@/lib/utils/product-images'

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

/**
 * Find offering by region slug and cultivar ID
 * Handles legacy region aliases by checking all regions with matching slug
 */
function findOfferingBySlug(
  regionSlug: string,
  cultivarId: string
): { offering: RegionalOffering; region: GrowingRegionExtended } | undefined {
  // Find all region IDs that have this slug (includes aliases)
  const matchingRegionIds = Object.entries(ALL_GROWING_REGIONS)
    .filter(([_, region]) => region.slug === regionSlug)
    .map(([id, _]) => id)

  // Search offerings for any matching region ID
  for (const regionId of matchingRegionIds) {
    const offering = REGIONAL_OFFERINGS.find(
      (o) => o.regionId === regionId && o.varietyId === cultivarId && o.isActive
    )
    if (offering) {
      const region = ALL_GROWING_REGIONS[regionId]
      return { offering, region }
    }
  }

  return undefined
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
        ? [{ '@type': 'PropertyValue', name: 'Quality Tier', value: offering.qualityTier }]
        : []),
      ...(cultivar.isHeritage
        ? [{ '@type': 'PropertyValue', name: 'Heritage Variety', value: 'true' }]
        : []),
      ...(cultivar.isNonGmo
        ? [{ '@type': 'PropertyValue', name: 'Non-GMO', value: 'true' }]
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

export default async function ProductPredictionPage({ params }: Props) {
  const { region: regionSlug, product: productSlug } = await params

  const cultivar = getCultivarFromSlug(productSlug)
  if (!cultivar) notFound()

  const product = PRODUCTS_BY_ID[cultivar.productId]
  if (!product) notFound()

  // Use the new helper that handles legacy aliases
  const result = findOfferingBySlug(regionSlug, cultivar.id)
  if (!result) notFound()

  const { offering, region } = result
  const details = getOfferingDetails(offering.id)
  // Use regionId_varietyId as unique key for consistent image across pages
  const imageUrl = getProductImage(cultivar.id, cultivar.productId, product.category, `${offering.regionId}_${cultivar.id}`)

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
          {/* Breadcrumb - typewriter style */}
          <nav className="mb-8 font-mono text-xs uppercase tracking-wider text-stone-500">
            <Link href="/predictions" className="hover:text-[var(--color-accent)] transition-colors">
              Regions
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/predictions/${region.slug}`} className="hover:text-[var(--color-accent)] transition-colors">
              {region.displayName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-stone-800">{cultivar.displayName}</span>
          </nav>

          {/* Main Recipe Card */}
          <article className="bg-[var(--color-parchment)] border border-stone-300 shadow-md p-6 sm:p-10">
            {/* Card Header - lined paper effect */}
            <div className="border-b-2 border-[var(--color-accent)] pb-4 mb-6">
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">
                {cultivar.displayName}
              </h1>
              <p className="mt-1 font-mono text-sm uppercase tracking-wider text-stone-500">
                {product.displayName}
              </p>
            </div>

            {/* Image - inset with border */}
            <div className="mb-8 p-2 bg-white border border-stone-200">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={cultivar.displayName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            </div>

            {/* Specs Grid - Typewriter Index Card Style */}
            <div className="grid gap-6 sm:grid-cols-2 mb-8">
              {/* Origin */}
              <div className="border-l-2 border-stone-300 pl-4">
                <dt className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-1">
                  Origin
                </dt>
                <dd className="font-serif text-lg text-stone-900">
                  {region.displayName}, {region.state}
                </dd>
              </div>

              {/* Category */}
              <div className="border-l-2 border-stone-300 pl-4">
                <dt className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-1">
                  Category
                </dt>
                <dd className="font-serif text-lg text-stone-900 capitalize">
                  {product.subcategory.replace(/_/g, ' ')}
                </dd>
              </div>

              {/* Quality */}
              {offering.qualityTier && (
                <div className="border-l-2 border-[var(--color-accent)] pl-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-1">
                    Quality
                  </dt>
                  <dd className="font-serif text-lg text-[var(--color-accent)] capitalize">
                    {offering.qualityTier}
                  </dd>
                </div>
              )}

              {/* Peak Season */}
              {details?.peakMonths && details.peakMonths.length > 0 && (
                <div className="border-l-2 border-stone-300 pl-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-1">
                    Peak Season
                  </dt>
                  <dd className="font-serif text-lg text-stone-900">
                    {details.peakMonths
                      .map((m) => new Date(2024, m - 1, 1).toLocaleString('en', { month: 'long' }))
                      .join(' – ')}
                  </dd>
                </div>
              )}

              {/* GDD to Maturity */}
              {details?.gddToMaturity && (
                <div className="border-l-2 border-stone-300 pl-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-1">
                    GDD to Maturity
                  </dt>
                  <dd className="font-serif text-lg text-stone-900">
                    {details.gddToMaturity.toLocaleString()}
                    <span className="text-sm text-stone-500 ml-1">(base {details.baseTemp || 50}°F)</span>
                  </dd>
                </div>
              )}

              {/* Harvest Window */}
              {details?.gddWindow && (
                <div className="border-l-2 border-stone-300 pl-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-1">
                    Harvest Window
                  </dt>
                  <dd className="font-serif text-lg text-stone-900">
                    {details.gddWindow} GDD
                  </dd>
                </div>
              )}
            </div>

            {/* Badges - Heritage / Non-GMO */}
            {(cultivar.isHeritage || cultivar.isNonGmo) && (
              <div className="flex gap-3 mb-8">
                {cultivar.isHeritage && (
                  <span className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-stone-400 text-stone-600">
                    Heritage Variety
                  </span>
                )}
                {cultivar.isNonGmo && (
                  <span className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-stone-400 text-stone-600">
                    Non-GMO
                  </span>
                )}
              </div>
            )}

            {/* Flavor Profile */}
            {cultivar.flavorProfile && (
              <div className="mb-8 p-6 bg-[var(--color-cream)] border-l-4 border-[var(--color-accent)]">
                <p className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-2">
                  Flavor Profile
                </p>
                <p className="font-serif text-lg text-stone-800 italic leading-relaxed">
                  "{cultivar.flavorProfile}"
                </p>
              </div>
            )}

            {/* Tasting Notes */}
            {offering.flavorNotes && (
              <div className="mb-8">
                <p className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-2">
                  Tasting Notes
                </p>
                <p className="font-serif text-stone-700 leading-relaxed">
                  {offering.flavorNotes}
                </p>
              </div>
            )}

            {/* Divider */}
            <hr className="border-t border-dashed border-stone-300 my-8" />

            {/* Region Info */}
            <div className="mb-8">
              <h2 className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-4">
                About the Region
              </h2>
              {region.notes && (
                <p className="font-serif text-stone-700 leading-relaxed mb-4">{region.notes}</p>
              )}
              <dl className="grid gap-4 sm:grid-cols-2 font-mono text-sm">
                <div>
                  <dt className="text-stone-400 uppercase tracking-wider">Location</dt>
                  <dd className="text-stone-800">{region.primaryCities[0]}, {region.state}</dd>
                </div>
                <div>
                  <dt className="text-stone-400 uppercase tracking-wider">Growing Season</dt>
                  <dd className="text-stone-800">{region.climate.frostFreeDays} frost-free days</dd>
                </div>
                {region.climate.usdaZone && (
                  <div>
                    <dt className="text-stone-400 uppercase tracking-wider">USDA Zone</dt>
                    <dd className="text-stone-800">{region.climate.usdaZone}</dd>
                  </div>
                )}
                {region.climate.annualGdd50 && (
                  <div>
                    <dt className="text-stone-400 uppercase tracking-wider">Annual GDD (base 50°F)</dt>
                    <dd className="text-stone-800">{region.climate.annualGdd50.toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/discover?lat=${region.latitude}&lon=${region.longitude}`}
                className="inline-flex items-center px-6 py-3 bg-[var(--color-accent)] text-white font-mono text-sm uppercase tracking-wider hover:bg-[var(--color-accent-dark)] transition-colors"
              >
                View Live Status
              </Link>
              <Link
                href={`/predictions/${region.slug}`}
                className="inline-flex items-center px-6 py-3 border border-stone-400 text-stone-700 font-mono text-sm uppercase tracking-wider hover:bg-stone-100 transition-colors"
              >
                All {region.displayName} Products
              </Link>
            </div>
          </article>
        </main>

        {/* Footer */}
        <footer className="bg-stone-900 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <span className="font-serif text-xl text-white">Fielder</span>
                <p className="mt-2 text-sm text-stone-400">Fresh produce at peak quality.</p>
              </div>
              <div className="flex gap-8 font-mono text-xs uppercase tracking-wider">
                <Link href="/discover" className="text-stone-400 hover:text-white transition-colors">
                  Discover
                </Link>
                <Link href="/predictions" className="text-stone-400 hover:text-white transition-colors">
                  Regions
                </Link>
                <Link href="/farm" className="text-stone-400 hover:text-white transition-colors">
                  For Farms
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-stone-800">
              <p className="font-mono text-xs text-stone-500">
                &copy; {new Date().getFullYear()} Fielder. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
