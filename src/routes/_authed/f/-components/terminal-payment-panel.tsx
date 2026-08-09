import { CreditCard } from 'lucide-react'

export function TerminalPaymentPanel() {
  return (
    <div className="mt-6 flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-5 text-center">
      <CreditCard className="size-6 text-foreground" strokeWidth={1.75} />
      <p className="text-sm font-semibold text-foreground">
        Aproxime ou insira o cartão no terminal da geladeira
      </p>
    </div>
  )
}
