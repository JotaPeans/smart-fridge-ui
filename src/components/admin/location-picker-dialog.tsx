import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Map, MapControls, MapMarker, MarkerContent } from '#/components/ui/map.tsx'

export function LocationPickerDialog({
  open,
  onOpenChange,
  lat,
  lng,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lat: number
  lng: number
  onConfirm: (coords: { lat: number; lng: number }) => void
}) {
  const [position, setPosition] = useState({ lat, lng })

  useEffect(() => {
    if (open) setPosition({ lat, lng })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajustar localização</DialogTitle>
          <DialogDescription>Arraste o marcador para a posição exata da geladeira.</DialogDescription>
        </DialogHeader>

        <div className="h-80 overflow-hidden rounded-2xl">
          <Map center={[position.lng, position.lat]} zoom={16} attributionControl={false}>
            <MapControls showLocate />
            <MapMarker
              longitude={position.lng}
              latitude={position.lat}
              draggable
              anchor="bottom"
              onDragEnd={({ lng: nextLng, lat: nextLat }) =>
                setPosition({ lat: nextLat, lng: nextLng })
              }
            >
              <MarkerContent>
                <MapPin
                  className="size-9 text-primary drop-shadow-md"
                  fill="currentColor"
                  stroke="white"
                  strokeWidth={1.5}
                />
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>

        <DialogFooter>
          <Button
            type="button"
            className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              onConfirm(position)
              onOpenChange(false)
            }}
          >
            Confirmar localização
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
