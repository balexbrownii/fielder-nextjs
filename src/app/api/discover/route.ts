/**
 * GET /api/discover
 *
 * Batch discovery endpoint - fetches predictions for all crops
 * in all regions, sorted by distance from user
 */

import { NextRequest, NextResponse } from 'next/server'
import { weatherService } from '@/lib/services/weather'
import { harvestPredictor } from '@/lib/services/harvest-predictor'
import { getGddTargets, CROP_GDD_TARGETS } from '@/lib/constants/gdd-targets'
import { US_GROWING_REGIONS } from '@/lib/constants/regions'
import { getDistanceMiles } from '@/lib/utils/distance'

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

// Cache predictions for 30 minutes (weather doesn't change that fast)
const cache = new Map<string, { data: DiscoveryItem[]; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lon = parseFloat(searchParams.get('lon') || '')

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: 'lat and lon query params are required' },
      { status: 400 }
    )
  }

  try {
    // Check cache first (cache key ignores user location since predictions are same)
    const cacheKey = new Date().toISOString().slice(0, 13) // Hour-based key
    const cached = cache.get(cacheKey)
    let allPredictions: DiscoveryItem[]

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      allPredictions = cached.data
    } else {
      // Fetch all predictions
      allPredictions = await fetchAllPredictions()
      cache.set(cacheKey, { data: allPredictions, timestamp: Date.now() })
    }

    // Add distance to each prediction and sort
    const withDistance = allPredictions.map(item => {
      const region = US_GROWING_REGIONS[item.region]
      const distance = getDistanceMiles(lat, lon, region.latitude, region.longitude)
      return { ...item, distanceMiles: distance }
    })

    // Separate into in-season and coming soon
    const inSeason = withDistance
      .filter(p => p.status === 'at_peak' || p.status === 'in_season')
      .sort((a, b) => {
        // At peak first, then by distance
        if (a.status === 'at_peak' && b.status !== 'at_peak') return -1
        if (b.status === 'at_peak' && a.status !== 'at_peak') return 1
        return a.distanceMiles - b.distanceMiles
      })

    const comingSoon = withDistance
      .filter(p => p.status === 'approaching' && (p.daysUntil ?? 999) <= 21)
      .sort((a, b) => {
        // Soonest first, then by distance
        const daysA = a.daysUntil ?? 999
        const daysB = b.daysUntil ?? 999
        if (daysA !== daysB) return daysA - daysB
        return a.distanceMiles - b.distanceMiles
      })

    return NextResponse.json({
      inSeason,
      comingSoon,
      totalRegions: Object.keys(US_GROWING_REGIONS).length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Discovery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discovery data' },
      { status: 500 }
    )
  }
}

/**
 * Fetch predictions for all viable crop/region combinations
 */
async function fetchAllPredictions(): Promise<DiscoveryItem[]> {
  const predictions: DiscoveryItem[] = []
  const today = new Date()
  const referenceDate = new Date(today.getFullYear(), 0, 1)

  // Build list of all crop/region combinations
  const combinations: { crop: string; region: string }[] = []
  for (const [regionId, region] of Object.entries(US_GROWING_REGIONS)) {
    for (const crop of region.viableCrops) {
      combinations.push({ crop, region: regionId })
    }
  }

  // Fetch GDD data for each region (deduplicated)
  const regionGddMap = new Map<string, { totalGdd: number; avgDailyGdd: number }>()

  await Promise.all(
    Object.entries(US_GROWING_REGIONS).map(async ([regionId, region]) => {
      // Use the first crop's base temp (most regions are citrus-heavy anyway)
      // This is a simplification - ideally we'd fetch per-crop base temps
      const firstCrop = region.viableCrops[0]
      const targets = getGddTargets(firstCrop)

      try {
        const gddData = await weatherService.getGddAccumulation(
          regionId,
          referenceDate,
          targets.baseTemp
        )
        regionGddMap.set(regionId, gddData)
      } catch (e) {
        console.error(`Failed to get GDD for ${regionId}:`, e)
      }
    })
  )

  // Generate predictions for each combination
  for (const { crop, region: regionId } of combinations) {
    const regionData = US_GROWING_REGIONS[regionId]
    const gddData = regionGddMap.get(regionId)

    if (!gddData) continue

    try {
      const targets = getGddTargets(crop)

      const window = harvestPredictor.predictHarvestWindow(
        crop,
        regionId,
        gddData.totalGdd,
        gddData.avgDailyGdd
      )

      const formatted = harvestPredictor.formatHarvestWindow(window)
      const status = harvestPredictor.getHarvestStatus(window)

      // Sugar/acid for citrus
      let sugarAcid
      if (['navel_orange', 'valencia', 'grapefruit', 'tangerine', 'satsuma'].includes(crop)) {
        sugarAcid = harvestPredictor.estimateSugarAcid(gddData.totalGdd)
      }

      // Format crop name
      const cropName = crop
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      predictions.push({
        crop,
        cropName,
        region: regionId,
        regionName: regionData.displayName,
        state: regionData.state,
        distanceMiles: 0, // Will be filled in later
        status: status.status,
        statusMessage: status.message,
        harvestStart: formatted.harvestStartDate,
        harvestEnd: formatted.harvestEndDate,
        optimalStart: formatted.optimalStartDate,
        optimalEnd: formatted.optimalEndDate,
        daysUntil: status.daysUntil,
        confidence: window.confidence,
        sugarAcid,
      })
    } catch (e) {
      console.error(`Failed to predict ${crop} in ${regionId}:`, e)
    }
  }

  return predictions
}
