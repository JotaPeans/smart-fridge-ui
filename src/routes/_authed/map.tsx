import { createFileRoute } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { BottomNav } from '#/components/site/bottom-nav.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'

export const Route = createFileRoute('/_authed/map')({ component: MapPage })

function MapPage() {
  return (
    <PhoneShell className="flex flex-col pb-32">
      <header className="px-6 pt-12">
        <h1 className="text-3xl font-extrabold text-foreground">Mapa</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MapPin className="size-7" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-muted-foreground">Em breve.</p>
      </div>

      <BottomNav />
    </PhoneShell>
  )
}
