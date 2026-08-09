import { cn } from '#/lib/utils.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'

const CONNECTION_LABEL: Record<FridgeResponseType['status'], string> = {
  online: 'Online',
  offline: 'Offline',
  maintenance: 'Manutenção',
}

const CONNECTION_DOT: Record<FridgeResponseType['status'], string> = {
  online: 'bg-mint',
  offline: 'bg-destructive',
  maintenance: 'bg-sand',
}

export function FridgeConnectionBadge({ status }: { status: FridgeResponseType['status'] }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground">
      <span className={cn('size-1.5 shrink-0 rounded-full', CONNECTION_DOT[status])} />
      {CONNECTION_LABEL[status]}
    </span>
  )
}
