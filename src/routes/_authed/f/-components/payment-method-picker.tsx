import { CreditCard, QrCode, Wallet } from 'lucide-react'
import { PAYMENT_METHOD_LABEL } from '#/domain/payment/types.ts'
import type { PaymentMethodType } from '#/domain/payment/types.ts'
import { cn } from '#/lib/utils.ts'

const METHOD_ICON: Record<PaymentMethodType, typeof QrCode> = {
  pix: QrCode,
  credito: CreditCard,
  debito: Wallet,
}

export function PaymentMethodPicker({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethodType[]
  value: PaymentMethodType
  onChange: (method: PaymentMethodType) => void
}) {
  if (methods.length <= 1) return null

  return (
    <div className="flex gap-2">
      {methods.map((method) => {
        const Icon = METHOD_ICON[method]
        const selected = method === value
        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-xs font-semibold transition-colors',
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground',
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
            {PAYMENT_METHOD_LABEL[method]}
          </button>
        )
      })}
    </div>
  )
}
