'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FarmDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple admin code check (in production, this would be server-side)
    if (adminCode === 'fielder2024' || adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid admin code')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-green-800">
                Fielder
              </Link>
            </div>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Farm Dashboard
            </h2>
            <p className="mb-6 text-gray-600">
              Enter your admin code to access the farm dashboard.
            </p>
            <form onSubmit={handleAuth}>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Admin code"
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {error && (
                <p className="mb-4 text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
              >
                Enter Dashboard
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Don&apos;t have access?{' '}
              <a href="mailto:farms@fielder.app" className="text-green-600 hover:underline">
                Contact us
              </a>
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-800">
              Fielder
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/discover"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Discover
              </Link>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Farm Dashboard
        </h1>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">Active Crops</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">At Peak</p>
            <p className="mt-2 text-3xl font-semibold text-green-600">0</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">Coming Soon</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">0</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">Profile Views</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">--</p>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="rounded-xl bg-green-50 p-6 ring-1 ring-green-200">
          <h2 className="text-lg font-semibold text-green-800">
            Welcome to Fielder!
          </h2>
          <p className="mt-2 text-green-700">
            To get started, you&apos;ll need to set up your farm profile and add your crops.
            This dashboard is a preview - full farm management features are coming soon.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 text-sm font-medium text-green-800">
                1
              </div>
              <span className="text-green-800">Set up your farm profile (name, location, contact)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 text-sm font-medium text-green-800">
                2
              </div>
              <span className="text-green-800">Add your crops (cultivars, rootstocks, tree age)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 text-sm font-medium text-green-800">
                3
              </div>
              <span className="text-green-800">Update availability and pricing when crops are ready</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Farm Profile</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your farm profile with location, contact info, and fulfillment options.
            </p>
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Coming Soon
            </span>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Crop Manager</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add crops with cultivar, rootstock, and tree age for accurate predictions.
            </p>
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Coming Soon
            </span>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Availability</h3>
            <p className="mt-1 text-sm text-gray-500">
              Toggle crop availability, set pricing, and update inventory levels.
            </p>
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Coming Soon
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
