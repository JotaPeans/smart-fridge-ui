import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CircleAlert, CreditCard, LockOpen, PackageCheck, Timer } from 'lucide-react'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { useSalePolling } from '#/domain/sale/query.ts'
import type { SaleStatus } from '#/domain/sale/types.ts'

interface SaleSearch {
  checkoutUrl?: string
}

export const Route = createFileRoute('/_authed/f/$fridgeId/sale/$saleId')({
  validateSearch: (search: Record<string, unknown>): SaleSearch => ({
    checkoutUrl: typeof search.checkoutUrl === 'string' ? search.checkoutUrl : undefined,
  }),
  component: SaleStatusPage,
})

const STATUS_COPY: Record<
  SaleStatus,
  { title: string; body: string; toneClass: string }
> = {
  AWAITING_PAYMENT: {
    title: 'Aguardando pagamento',
    body: 'Vamos destravar a porta assim que seu pagamento for confirmado.',
    toneClass: 'bg-frost',
  },
  PAID: {
    title: 'Pagamento confirmado',
    body: 'Abrindo a porta da geladeira…',
    toneClass: 'bg-mint',
  },
  DOOR_OPEN: {
    title: 'Porta destravada',
    body: 'Retire seu(s) produto(s) e feche a porta.',
    toneClass: 'bg-mint',
  },
  DOOR_CLOSED: {
    title: 'Porta fechada',
    body: 'Finalizando seu pedido…',
    toneClass: 'bg-mint',
  },
  COMPLETED: {
    title: 'Tudo certo',
    body: 'Obrigado pela sua compra!',
    toneClass: 'bg-mint',
  },
  CANCELLED: {
    title: 'Pagamento cancelado',
    body: 'Seu pagamento foi cancelado ou expirou. Você pode tentar novamente.',
    toneClass: 'bg-blush',
  },
}

function SaleStatusPage() {
  const { fridgeId, saleId } = Route.useParams()
  const { checkoutUrl } = Route.useSearch()
  const navigate = useNavigate()
  const { data: sale, timedOut } = useSalePolling(saleId)
  const openedRef = useRef(false)

  useEffect(() => {
    if (checkoutUrl && sale?.status === 'AWAITING_PAYMENT' && !openedRef.current) {
      openedRef.current = true
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
    }
  }, [checkoutUrl, sale?.status])

  if (timedOut && sale?.status === 'AWAITING_PAYMENT') {
    return (
      <PhoneShell className="flex flex-col items-center justify-center gap-4 bg-blush px-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Timer className="size-7" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Ainda esperando?</h1>
        <p className="max-w-xs text-sm text-foreground/70">
          Ainda não confirmamos seu pagamento. Você pode continuar aguardando ou começar de
          novo.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
          className="mt-4 h-13 w-full max-w-xs rounded-full bg-primary text-base font-semibold text-primary-foreground"
        >
          Voltar
        </button>
      </PhoneShell>
    )
  }

  if (!sale) {
    return (
      <PhoneShell className="flex min-h-dvh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </PhoneShell>
    )
  }

  const copy = STATUS_COPY[sale.status]
  const Icon =
    sale.status === 'AWAITING_PAYMENT'
      ? CreditCard
      : sale.status === 'CANCELLED'
        ? CircleAlert
        : sale.status === 'DOOR_OPEN'
          ? LockOpen
          : PackageCheck

  return (
    <PhoneShell
      className={`flex flex-col items-center justify-center gap-1 px-8 text-center ${copy.toneClass}`}
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {sale.status === 'AWAITING_PAYMENT' ? (
          <div className="size-6 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
        ) : (
          <Icon className="size-9" strokeWidth={2} />
        )}
      </div>

      <h1 className="mt-8 text-3xl font-extrabold text-foreground">{copy.title}</h1>
      <p className="mt-3 max-w-xs text-base text-foreground/70">{copy.body}</p>

      <p className="mt-6 rounded-full bg-background/70 px-4 py-2 text-sm font-semibold text-foreground">
        {sale.items.reduce((n, item) => n + item.quantity, 0)} item(ns) · R${' '}
        {sale.totalAmount.toFixed(2)}
      </p>

      {sale.status === 'AWAITING_PAYMENT' && checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 h-13 flex w-full max-w-xs items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
        >
          Abrir página de pagamento
        </a>
      )}

      {sale.status === 'CANCELLED' && (
        <button
          type="button"
          onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
          className="mt-8 h-13 w-full max-w-xs rounded-full bg-primary text-base font-semibold text-primary-foreground"
        >
          Tentar novamente
        </button>
      )}

      {sale.status === 'COMPLETED' && (
        <button
          type="button"
          onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
          className="mt-8 h-13 w-full max-w-xs rounded-full bg-primary text-base font-semibold text-primary-foreground"
        >
          Concluir
        </button>
      )}
    </PhoneShell>
  )
}
