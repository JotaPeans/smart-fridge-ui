import { useState } from 'react'
import { TrendingUp, Trophy, Clock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { Skeleton } from '#/components/ui/skeleton.tsx'
import {
  usePeakHours,
  useSalesByPeriod,
  useSalesVolume,
  useTopProducts,
} from '#/domain/sale/query.ts'
import type { AnalyticsFilters } from '#/domain/sale/types.ts'

export function AnalyticsPanel({ filters = {} }: { filters?: AnalyticsFilters }) {
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day')

  const { data: volume, isPending: volumePending } = useSalesVolume(filters)
  const { data: byPeriod, isPending: byPeriodPending } = useSalesByPeriod(filters, groupBy)
  const { data: topProducts, isPending: topPending } = useTopProducts(filters, 5)
  const { data: peakHours, isPending: peakPending } = usePeakHours(filters)

  const maxPeriod = Math.max(1, ...(byPeriod?.map((p) => p.totalAmount) ?? [0]))
  const maxHour = Math.max(1, ...(peakHours?.map((p) => p.count) ?? [0]))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatTile
          label="Vendas"
          value={volumePending ? undefined : String(volume?.count ?? 0)}
          tone="mint"
        />
        <StatTile
          label="Faturamento"
          value={volumePending ? undefined : `R$ ${(volume?.totalAmount ?? 0).toFixed(2)}`}
          tone="lavender"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" strokeWidth={2.25} />
            <h3 className="text-sm font-semibold text-foreground">Vendas por período</h3>
          </div>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="h-9 w-32 rounded-full border-border bg-muted text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 flex h-40 items-end gap-1.5">
          {byPeriodPending &&
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: '60%' }} />
            ))}
          {!byPeriodPending && byPeriod?.length === 0 && (
            <p className="w-full text-center text-sm text-muted-foreground">
              Sem dados neste período.
            </p>
          )}
          {!byPeriodPending &&
            byPeriod?.map((entry) => (
              <div
                key={entry.period}
                className="group relative flex-1 rounded-t-md bg-mint"
                style={{ height: `${Math.max(6, (entry.totalAmount / maxPeriod) * 100)}%` }}
                title={`${entry.period}: R$ ${entry.totalAmount.toFixed(2)} (${entry.count} vendas)`}
              />
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-muted-foreground" strokeWidth={2.25} />
            <h3 className="text-sm font-semibold text-foreground">Mais vendidos</h3>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {topPending &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-xl" />)}
            {!topPending && topProducts?.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem vendas ainda.</p>
            )}
            {!topPending &&
              topProducts?.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    {p.productName}
                  </span>
                  <span className="font-semibold text-muted-foreground">{p.quantitySold} un.</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" strokeWidth={2.25} />
            <h3 className="text-sm font-semibold text-foreground">Horários de pico</h3>
          </div>
          <div className="mt-4 flex h-24 items-end gap-1">
            {peakPending &&
              Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: '50%' }} />
              ))}
            {!peakPending &&
              Array.from({ length: 24 }).map((_, hour) => {
                const entry = peakHours?.find((p) => p.hour === hour)
                const count = entry?.count ?? 0
                return (
                  <div
                    key={hour}
                    className="group relative flex-1 rounded-t-sm bg-lavender"
                    style={{ height: `${Math.max(4, (count / maxHour) * 100)}%` }}
                    title={`${hour}h: ${count} venda(s)`}
                  />
                )
              })}
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0h</span>
            <span>12h</span>
            <span>23h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value?: string
  tone: 'mint' | 'lavender'
}) {
  return (
    <div className={`rounded-3xl p-5 ${tone === 'mint' ? 'bg-mint' : 'bg-lavender'}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
        {label}
      </p>
      {value === undefined ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-1 text-3xl font-extrabold text-foreground">{value}</p>
      )}
    </div>
  )
}
