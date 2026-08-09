import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

function getRemainingSeconds(expiresAt: string) {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function PixPaymentPanel({
  pixCode,
  qrCodeBase64,
  expiresAt,
}: {
  pixCode: string
  qrCodeBase64: string
  expiresAt: string
}) {
  const [copied, setCopied] = useState(false)
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(expiresAt))

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemainingSeconds(expiresAt)), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  async function handleCopy() {
    await navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 flex w-full max-w-xs flex-col items-center gap-3">
      <img
        src={`data:image/png;base64,${qrCodeBase64}`}
        alt="QR code Pix"
        className="size-48 rounded-2xl border border-border bg-background object-contain p-2"
      />
      {remaining > 0 ? (
        <p className="text-xs font-semibold text-muted-foreground">
          Expira em {formatRemaining(remaining)}
        </p>
      ) : (
        <p className="text-xs font-semibold text-destructive">QR code expirado</p>
      )}
      <button
        type="button"
        onClick={() => {
          handleCopy().catch(() => {})
        }}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-semibold text-foreground"
      >
        {copied ? (
          <Check className="size-4" strokeWidth={2.25} />
        ) : (
          <Copy className="size-4" strokeWidth={2.25} />
        )}
        {copied ? 'Código copiado' : 'Copiar código Pix'}
      </button>
    </div>
  )
}
