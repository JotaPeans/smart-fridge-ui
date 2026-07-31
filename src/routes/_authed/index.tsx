import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { QrCode, Refrigerator } from 'lucide-react'
import { BottomNav } from '#/components/site/bottom-nav.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { useMe } from '#/domain/user/query.ts'

export const Route = createFileRoute('/_authed/')({ component: FridgeEntry })

function FridgeEntry() {
  const { data: user } = useMe()
  const navigate = useNavigate()
  const [fridgeId, setFridgeId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fridgeId.trim()) return
    navigate({ to: '/f/$fridgeId', params: { fridgeId: fridgeId.trim() } })
  }

  const firstName = user?.name?.split(' ')[0]

  return (
    <PhoneShell className="flex flex-col pb-32">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <Refrigerator className="size-8" strokeWidth={2} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-foreground">
          {firstName ? `Olá, ${firstName}` : 'Bem-vindo'}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Escaneie o QR code da geladeira ou digite o código dela abaixo para ver o que tem
          dentro.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-muted px-4">
            <QrCode className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
            <Input
              value={fridgeId}
              onChange={(e) => setFridgeId(e.target.value)}
              placeholder="Código da geladeira"
              className="h-12 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
              required
            />
          </div>
          <Button
            type="submit"
            className="h-13 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continuar
          </Button>
        </form>
      </div>

      <BottomNav />
    </PhoneShell>
  )
}
