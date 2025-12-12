import Link from 'next/link'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-[var(--color-cream)] to-green-50" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-stone-200/50">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-stone-600">
                  Now tracking 90+ growing regions
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
                Know When It&apos;s{' '}
                <span className="text-[var(--color-accent)]">At Peak</span>
              </h1>

              {/* Subhead */}
              <p className="mt-6 text-lg leading-8 text-stone-600 sm:text-xl">
                Science-backed harvest predictions meet the freshest local produce.
                Discover exactly when fruit reaches perfect ripeness—sweet,
                complex, unforgettable.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/discover"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[var(--color-accent-dark)] hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
                >
                  Discover What&apos;s Fresh
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  href="/predictions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-stone-900 shadow-sm ring-1 ring-stone-200 transition-all hover:bg-stone-50 hover:ring-stone-300 active:scale-[0.98]"
                >
                  Browse by Region
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-cream)] to-transparent" />
      </section>

      {/* Category Preview */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
              Fresh From the Field
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Track peak freshness across every category
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <CategoryCard
              name="Fruits"
              icon="🍎"
              color="bg-gradient-to-br from-red-100 to-orange-100"
              count={45}
            />
            <CategoryCard
              name="Vegetables"
              icon="🥬"
              color="bg-gradient-to-br from-green-100 to-emerald-100"
              count={32}
            />
            <CategoryCard
              name="Nuts"
              icon="🥜"
              color="bg-gradient-to-br from-amber-100 to-yellow-100"
              count={8}
            />
            <CategoryCard
              name="Meat"
              icon="🥩"
              color="bg-gradient-to-br from-rose-100 to-red-100"
              count={6}
            />
            <CategoryCard
              name="Dairy"
              icon="🥚"
              color="bg-gradient-to-br from-blue-100 to-sky-100"
              count={4}
            />
            <CategoryCard
              name="Honey"
              icon="🍯"
              color="bg-gradient-to-br from-yellow-100 to-amber-100"
              count={3}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
              The Science of Fresh
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              We use Growing Degree Day models—the same science used by orchards
              and researchers—to predict exactly when produce hits peak quality.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Track Weather"
              description="We monitor temperature data across 90+ growing regions, calculating heat accumulation that drives crop development."
            />
            <FeatureCard
              number="02"
              title="Predict Harvest"
              description="Each variety has a GDD threshold for peak quality. We know when Honeycrisp hits 2,500 GDD or Navel oranges reach 3,800."
            />
            <FeatureCard
              number="03"
              title="Find Fresh"
              description="Browse what's at peak near you. Sort by distance, filter by type, and discover farms with exactly what you're looking for."
            />
          </div>
        </div>
      </section>

      {/* Featured Regions */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
                Explore Regions
              </h2>
              <p className="mt-4 text-lg text-stone-600">
                From California citrus to Michigan cherries
              </p>
            </div>
            <Link
              href="/predictions"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]"
            >
              View all regions
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RegionCard
              name="Vero Beach, FL"
              region="Indian River District"
              products={['Citrus', 'Grapefruit']}
              color="from-orange-500 to-yellow-500"
              slug="vero-beach-fl"
            />
            <RegionCard
              name="Fresno, CA"
              region="San Joaquin Valley"
              products={['Stone Fruit', 'Citrus', 'Grapes']}
              color="from-purple-500 to-pink-500"
              slug="fresno-ca"
            />
            <RegionCard
              name="Traverse City, MI"
              region="Northwest Michigan"
              products={['Cherries', 'Apples']}
              color="from-red-500 to-rose-500"
              slug="traverse-city-mi"
            />
            <RegionCard
              name="Yakima, WA"
              region="Yakima Valley"
              products={['Apples', 'Pears', 'Hops']}
              color="from-green-500 to-emerald-500"
              slug="yakima-wa"
            />
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/predictions"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]"
            >
              View all 90+ regions
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-stone-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white sm:text-4xl">
              Ready to taste the difference?
            </h2>
            <p className="mt-4 text-lg text-stone-400">
              Stop guessing. Start knowing. Find produce at its absolute peak.
            </p>
            <Link
              href="/discover"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-stone-900 transition-all hover:bg-stone-100 active:scale-[0.98]"
            >
              Discover What&apos;s Fresh
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

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
              <Link href="/discover" className="text-sm text-stone-400 hover:text-white">
                Discover
              </Link>
              <Link href="/predictions" className="text-sm text-stone-400 hover:text-white">
                Regions
              </Link>
              <Link href="/farm" className="text-sm text-stone-400 hover:text-white">
                For Farms
              </Link>
              <Link href="/about" className="text-sm text-stone-400 hover:text-white">
                About
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800">
            <p className="text-sm text-stone-500">
              © {new Date().getFullYear()} Fielder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CategoryCard({
  name,
  icon,
  color,
  count,
}: {
  name: string
  icon: string
  color: string
  count: number
}) {
  return (
    <Link
      href={`/discover?categories=${name.toLowerCase()}`}
      className={`group relative overflow-hidden rounded-2xl ${color} p-6 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-stone-900">{name}</h3>
      <p className="text-sm text-stone-600">{count} varieties</p>
    </Link>
  )
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="relative">
      <div className="mb-4">
        <span className="font-[family-name:var(--font-display)] text-5xl font-semibold text-stone-200">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  )
}

function RegionCard({
  name,
  region,
  products,
  color,
  slug,
}: {
  name: string
  region: string
  products: string[]
  color: string
  slug: string
}) {
  return (
    <Link
      href={`/predictions/${slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50 transition-all hover:shadow-lg hover:ring-stone-300 active:scale-[0.98]"
    >
      {/* Gradient header */}
      <div className={`h-24 bg-gradient-to-br ${color}`} />

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-stone-900 group-hover:text-[var(--color-accent)] transition-colors">
          {name}
        </h3>
        <p className="text-sm text-stone-500 mt-1">{region}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {products.map((product) => (
            <span
              key={product}
              className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600"
            >
              {product}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}
