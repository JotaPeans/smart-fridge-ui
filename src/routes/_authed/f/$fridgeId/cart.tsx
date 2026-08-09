import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Minus, PackageOpen, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { PaymentMethodPicker } from '#/routes/_authed/f/-components/payment-method-picker.tsx'
import { useCart } from '#/domain/cart/store.tsx'
import { useFridge } from '#/domain/fridge/query.ts'
import { useCheckoutMutation } from '#/domain/payment/query.ts'
import type { PaymentMethodType } from '#/domain/payment/types.ts'
import { useProducts } from '#/domain/product/query.ts'
import { toneClasses, toneForId } from '#/lib/product-tone.ts'

export const Route = createFileRoute('/_authed/f/$fridgeId/cart')({ component: Cart })

const METHODS_BY_GATEWAY: Record<'ABACATEPAY' | 'MERCADOPAGO', PaymentMethodType[]> = {
  ABACATEPAY: ['pix'],
  MERCADOPAGO: ['pix', 'credito', 'debito'],
}

function Cart() {
  const { fridgeId } = Route.useParams()
  const navigate = useNavigate()
  const cart = useCart()
  const { data: fridge } = useFridge(fridgeId)
  const { data: products } = useProducts(fridgeId)
  const checkoutMutation = useCheckoutMutation()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix')

  const items = cart.fridgeId === fridgeId ? cart.items : []
  const stockById = new Map(products?.items.map((p) => [p.id, p.stock]) ?? [])
  const hasStockConflict = items.some((item) => {
    const stock = stockById.get(item.productId)
    return stock !== undefined && item.quantity > stock
  })
  const availableMethods = fridge ? METHODS_BY_GATEWAY[fridge.gatewayType] : (['pix'] as PaymentMethodType[])
  const selectedMethod = availableMethods.includes(paymentMethod) ? paymentMethod : 'pix'

  async function handlePay() {
    const result = await checkoutMutation.mutateAsync({
      fridgeId,
      paymentMethod: selectedMethod,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    })
    if (!result) return
    cart.clear()
    navigate({
      to: '/f/$fridgeId/sale/$saleId',
      params: { fridgeId, saleId: result.saleId },
      search:
        result.type === 'redirect'
          ? { checkoutUrl: result.checkoutUrl }
          : result.type === 'pix'
            ? { pixCode: result.pixCode, qrCodeBase64: result.qrCodeBase64, expiresAt: result.expiresAt }
            : { terminal: true },
    })
  }

  return (
    <PhoneShell className="flex flex-col pb-10">
      <header className="flex items-center justify-between px-6 pt-12">
        <h1 className="text-2xl font-extrabold text-foreground">Carrinho</h1>
        <button
          type="button"
          onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
          aria-label="Voltar"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
        >
          <ChevronLeft className="size-5" strokeWidth={2.25} />
        </button>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBasket className="size-7" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          <button
            type="button"
            onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Ver produtos
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-4 px-6">
            {items.map((item) => {
              const tone = toneForId(item.productId)
              const stock = stockById.get(item.productId)
              const overStock = stock !== undefined && item.quantity > stock
              return (
                <div key={item.productId} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${toneClasses[tone]}`}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <PackageOpen className="size-6 text-foreground/80" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {item.price.toFixed(2)} un.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.removeItem(item.productId)}
                      aria-label={`Remover ${item.name}`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                    >
                      <Trash2 className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pl-[4.25rem]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(item.productId, item.quantity - 1, stock)}
                        aria-label="Diminuir quantidade"
                        className="flex size-8 items-center justify-center rounded-full border border-border text-foreground"
                      >
                        <Minus className="size-3.5" strokeWidth={2.5} />
                      </button>
                      <span className="min-w-6 text-center text-sm font-extrabold tabular-nums text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(item.productId, item.quantity + 1, stock)}
                        aria-label="Aumentar quantidade"
                        disabled={stock !== undefined && item.quantity >= stock}
                        className="flex size-8 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
                      >
                        <Plus className="size-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  {overStock && (
                    <p className="pl-[4.25rem] text-xs font-semibold text-destructive">
                      Só restam {stock} em estoque — ajuste a quantidade
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-auto px-6 pt-10">
            <PaymentMethodPicker
              methods={availableMethods}
              value={selectedMethod}
              onChange={setPaymentMethod}
            />
          </div>

          <div className="flex items-baseline justify-between px-6 pt-4">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-2xl font-extrabold text-foreground">
              R$ {cart.totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 px-6">
            <button
              type="button"
              onClick={() => {
                handlePay().catch((error: { message?: string }) => {
                  toast.error(error?.message ?? 'Não foi possível iniciar o pagamento')
                })
              }}
              disabled={checkoutMutation.isPending || hasStockConflict}
              className="flex h-14 w-full items-center gap-3 rounded-full bg-primary pl-1.5 pr-6 text-primary-foreground transition-opacity disabled:opacity-70"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary">
                <ShoppingBasket className="size-5" strokeWidth={2.25} />
              </span>
              <span className="flex-1 text-left text-base font-semibold">
                {checkoutMutation.isPending ? 'Iniciando pagamento…' : 'Pagar'}
              </span>
            </button>
          </div>
        </>
      )}
    </PhoneShell>
  )
}
