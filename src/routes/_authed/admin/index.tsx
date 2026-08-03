import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AdminShell } from '#/components/admin/admin-shell.tsx'
import { AnalyticsPanel } from '#/components/admin/analytics-panel.tsx'
import { Input } from '#/components/ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { useFridges } from '#/domain/fridge/query.ts'

export const Route = createFileRoute('/_authed/admin/')({
  component: AdminAnalytics,
})

function AdminAnalytics() {
  const { data: fridges } = useFridges(1, 100)
  const [fridgeId, setFridgeId] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vendas, faturamento e horários de pico das suas geladeiras.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={fridgeId} onValueChange={setFridgeId}>
            <SelectTrigger className="h-11 w-52 rounded-2xl border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as minhas geladeiras</SelectItem>
              {fridges?.items.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-11 w-40 rounded-2xl border-border bg-background"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-11 w-40 rounded-2xl border-border bg-background"
          />
        </div>
      </div>

      <div className="mt-6">
        <AnalyticsPanel
          filters={{
            fridgeId: fridgeId === 'all' ? undefined : fridgeId,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          }}
        />
      </div>
    </AdminShell>
  )
}
