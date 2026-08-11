import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  Minus,
  PackageOpen,
  Plus,
  ShoppingBasket,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "#/domain/cart/store.tsx";
import { useProduct } from "#/domain/product/query.ts";
import { toneClasses, toneForId } from "#/lib/product-tone.ts";

export const Route = createFileRoute("/_authed/f/$fridgeId/product/$productId")(
  {
    component: ProductDetail,
  },
);

function ProductDetail() {
  const { fridgeId, productId } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isPending, isError } = useProduct(productId);
  const cart = useCart();
  const [qty, setQty] = useState(1);

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center sm:min-h-[calc(100dvh-5rem)]">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center sm:min-h-[calc(100dvh-5rem)]">
        <p className="text-sm text-muted-foreground">
          Este produto não foi encontrado.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/f/$fridgeId", params: { fridgeId } })}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Voltar
        </button>
      </div>
    );
  }

  const tone = toneForId(product.id);
  const total = (product.price * qty).toFixed(2);

  function handleAddToCart() {
    if (!product) return;
    const p = product;
    cart.addItem(
      fridgeId,
      {
        productId: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
      },
      qty,
      p.stock,
    );
    toast.success(`${p.name} adicionado ao carrinho`);
    navigate({ to: "/f/$fridgeId", params: { fridgeId } });
  }

  return (
    <div className="flex min-h-dvh flex-col pb-6 sm:min-h-[calc(100dvh-5rem)]">
      <header className="flex items-center justify-between px-6 pt-8">
        <h1 className="text-2xl font-extrabold text-foreground">
          {product.name}
        </h1>
        <button
          type="button"
          onClick={() => navigate({ to: "/f/$fridgeId", params: { fridgeId } })}
          aria-label="Voltar"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-transform active:scale-90"
        >
          <ChevronLeft className="size-5" strokeWidth={2.25} />
        </button>
      </header>

      <div className="flex-1 flex flex-col">
        <div
          className={`relative mx-6 mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-[2rem]`}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <PackageOpen
              className="size-20 text-foreground/80"
              strokeWidth={1.25}
            />
          )}
        </div>
        {product.description && (
          <div className=" rounded-full bg-card px-5 py-2.5 shadow-xs w-fit mx-auto">
            <p className="text-xs font-semibold text-muted-foreground">
              {product.description}
            </p>
          </div>
        )}

        {product.stock === 0 ? (
          <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
            Fora de estoque
          </p>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-6 px-6">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
              className="flex size-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
              disabled={qty <= 1}
            >
              <Minus className="size-4" strokeWidth={2.5} />
            </button>
            <span className="min-w-8 text-center text-3xl font-extrabold tabular-nums text-foreground">
              {qty.toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              aria-label="Aumentar quantidade"
              className="flex size-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
              disabled={qty >= product.stock}
            >
              <Plus className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between px-6 pt-6">
        <span className="text-sm font-medium text-muted-foreground">Total</span>
        <span className="text-2xl font-extrabold text-foreground">
          R$ {total}
        </span>
      </div>

      <div className="mt-4 px-6">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          <ShoppingBasket className="size-5" strokeWidth={2.25} />
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
