import { useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MapPin, Navigation, Refrigerator } from 'lucide-react'
import { BottomNav } from '#/components/site/bottom-nav.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { Slider } from '#/components/ui/slider.tsx'
import {
  Map,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from '#/components/ui/map.tsx'
import { useGeolocation } from '#/hooks/use-geolocation.ts'
import { useNearbyFridges } from '#/domain/fridge/query.ts'
import { circlePolygon } from '#/lib/geo.ts'

const MIN_RADIUS_KM = 1
const MAX_RADIUS_KM = 10

export const Route = createFileRoute('/_authed/map')({ component: MapPage })

function MapPage() {
  const geolocation = useGeolocation()
  const origin = geolocation.status === 'success' ? geolocation.coords : undefined
  const [radiusKm, setRadiusKm] = useState(5)
  const { data: nearby, isPending } = useNearbyFridges(origin, radiusKm)
  const navigate = useNavigate()

  const radiusCircle = useMemo(
    () => (origin ? circlePolygon(origin, radiusKm) : null),
    [origin, radiusKm],
  )

  return (
    <PhoneShell className="flex flex-col pb-1">
      <header className="px-6 pt-12">
        <h1 className="text-3xl font-extrabold text-foreground">Mapa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Geladeiras num raio de {radiusKm}km da sua localização.
        </p>
      </header>

      {origin && (
        <div className="mt-4 flex items-center gap-3 px-6">
          <span className="shrink-0 text-xs font-semibold text-foreground">
            Raio: {radiusKm}km
          </span>
          <Slider
            value={[radiusKm]}
            onValueChange={([value]) => setRadiusKm(value)}
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            step={1}
            className="flex-1"
          />
        </div>
      )}

      <div className="relative mt-4 flex flex-1 flex-col px-1 rounded-t-2xl">
        {geolocation.status === 'error' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Navigation className="size-7" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">{geolocation.message}</p>
          </div>
        )}

        {(geolocation.status === 'idle' || geolocation.status === 'loading') && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Obtendo sua localização…</p>
          </div>
        )}

        {origin && (
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl">
            <Map
              className="flex-1"
              center={[origin.lng, origin.lat]}
              zoom={13}
              loading={isPending}
              attributionControl={false}
              theme="light"
            >
              <MapControls position="top-right" showLocate showFullscreen />

              {radiusCircle && (
                <MapGeoJSON
                  data={radiusCircle}
                  fillPaint={{ 'fill-color': '#dbeafe', 'fill-opacity': 0.35 }}
                  linePaint={{ 'line-color': '#93c5fd', 'line-width': 1.5, 'line-opacity': 0.7 }}
                />
              )}

              <MapMarker longitude={origin.lng} latitude={origin.lat}>
                <MarkerContent className="size-4 rounded-full border-2 border-gray-300 bg-blue-500 shadow-sm" />
              </MapMarker>

              {nearby?.map(({ fridge, distanceKm }) => (
                <MapMarker key={fridge.id} longitude={fridge.lng} latitude={fridge.lat}>
                  <MarkerContent className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg">
                    <Refrigerator className="size-4" strokeWidth={2} />
                  </MarkerContent>
                  <MarkerPopup>
                    <p className="font-semibold text-foreground">{fridge.name}</p>
                    {fridge.location && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{fridge.location}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {distanceKm < 1
                        ? `${Math.round(distanceKm * 1000)} m de distância`
                        : `${distanceKm.toFixed(1)} km de distância`}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({ to: '/f/$fridgeId', params: { fridgeId: fridge.id } })
                      }
                      className="mt-2 w-full rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Ver geladeira
                    </button>
                  </MarkerPopup>
                </MapMarker>
              ))}
            </Map>
          </div>
        )}

        {origin && !isPending && nearby?.length === 0 && (
          <div className="absolute inset-x-0 top-4 z-10 flex justify-center px-4">
            <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-lg">
              <MapPin className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-xs font-medium text-muted-foreground">
                Nenhuma geladeira encontrada num raio de {radiusKm}km.
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </PhoneShell>
  )
}
