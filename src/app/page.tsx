import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-800">Fielder</h1>
            <nav className="flex gap-4">
              <Link
                href="/discover"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Discover
              </Link>
              <Link
                href="/farm"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Farm Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Know When It&apos;s{' '}
            <span className="text-green-600">At Peak</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Fielder connects you with local farms and tells you exactly when
            their fruit is at peak quality. Science-backed harvest predictions
            meet the freshest local produce.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/discover"
              className="rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Discover What&apos;s At Peak
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Peak Quality</h3>
            <p className="mt-2 text-gray-600">
              Our Growing Degree Day models predict exactly when fruit reaches
              optimal sweetness, acidity, and flavor.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Local Farms</h3>
            <p className="mt-2 text-gray-600">
              Connect directly with farms in your region. Know their cultivars,
              rootstocks, and what makes their fruit special.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
            <p className="mt-2 text-gray-600">
              Weather-adjusted predictions update daily. Know when to buy and
              when to wait for peak quality.
            </p>
          </div>
        </div>

        {/* Supported Crops */}
        <div className="mt-24">
          <h3 className="text-center text-2xl font-bold text-gray-900">
            Supported Crops
          </h3>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {[
              'Navel Orange', 'Valencia', 'Grapefruit', 'Tangerine', 'Satsuma',
              'Peach', 'Sweet Cherry', 'Tart Cherry',
              'Apple', 'Pear',
              'Strawberry', 'Blueberry',
              'Mango', 'Pomegranate', 'Pecan'
            ].map((crop) => (
              <span
                key={crop}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-2xl bg-green-700 px-6 py-12 text-center sm:px-12">
          <h3 className="text-2xl font-bold text-white">
            Are you a farm?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-green-100">
            Join Fielder to connect with consumers who value peak quality.
            Manage your crops, set availability, and let our predictions do
            the marketing.
          </p>
          <Link
            href="/farm"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-lg font-semibold text-green-700 hover:bg-green-50"
          >
            Farm Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Fielder &mdash; One who is in the field; one who works, watches, or takes part in what happens on the land.
          </p>
        </div>
      </footer>
    </div>
  )
}
