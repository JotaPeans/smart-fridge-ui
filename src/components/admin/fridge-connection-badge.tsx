import { cn } from '#/lib/utils.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'

const CONNECTION_LABEL: Record<FridgeResponseType['status'], string> = {
  online: 'Online',
  offline: 'Offline',
  maintenance: 'Manutenção',
}

const CONNECTION_CLASSES: Record<FridgeResponseType['status'], string> = {
  online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  offline: 'bg-destructive/10 text-destructive dark:bg-destructive/15',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
}

const CONNECTION_DOT: Record<FridgeResponseType['status'], string> = {
  online: 'bg-emerald-600 dark:bg-emerald-400',
  offline: 'bg-destructive',
  maintenance: 'bg-amber-600 dark:bg-amber-400',
}

export function FridgeConnectionBadge({ status }: { status: FridgeResponseType['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        CONNECTION_CLASSES[status],
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', CONNECTION_DOT[status])} />
      {CONNECTION_LABEL[status]}
    </span>
  )
}
