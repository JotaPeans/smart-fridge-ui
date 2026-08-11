import type * as GeoJSON from 'geojson'

const EARTH_RADIUS_KM = 6371

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Approximates a circle of `radiusKm` around `center` as a GeoJSON polygon. */
export function circlePolygon(
  center: { lat: number; lng: number },
  radiusKm: number,
  points = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = []
  const latRad = (center.lat * Math.PI) / 180

  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points
    const dLat = (radiusKm / EARTH_RADIUS_KM) * Math.cos(angle)
    const dLng = ((radiusKm / EARTH_RADIUS_KM) * Math.sin(angle)) / Math.cos(latRad)

    coords.push([
      center.lng + (dLng * 180) / Math.PI,
      center.lat + (dLat * 180) / Math.PI,
    ])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

export interface CepGeocodeResult {
  lat: number
  lng: number
  displayName: string
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

export async function geocodeCep(cep: string): Promise<CepGeocodeResult | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length < 8) return null

  const url = `https://nominatim.openstreetmap.org/search?q=${digits}&accept-language=pt-BR&format=jsonv2`
  const response = await fetch(url)
  if (!response.ok) return null

  const results: NominatimResult[] = await response.json()
  const first = results[0]
  if (!first) return null

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    displayName: first.display_name,
  }
}
