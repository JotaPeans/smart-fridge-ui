import { Link, useRouterState } from '@tanstack/react-router'
import { Home, User } from 'lucide-react'
import { useCart } from '#/domain/cart/store.tsx'
import { cn } from '#/lib/utils.ts'

export function BottomNav({ fridgeId }: { fridgeId?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const cart = useCart()
  const activeFridgeId = fridgeId ?? cart.fridgeId ?? undefined

  const items = [
    {
      to: activeFridgeId ? `/f/${activeFridgeId}` : '/',
      icon: Home,
      label: 'Início',
    },
    { to: '/account', icon: User, label: 'Conta' },
  ] as const

  return (
    <nav className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-6 sm:absolute">
      <div className="flex items-center gap-2 rounded-full bg-primary px-3 py-2.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)]">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={label}
              to={to}
              aria-label={label}
              className={cn(
                'flex size-11 items-center justify-center rounded-full transition-colors',
                active
                  ? 'bg-primary-foreground text-primary'
                  : 'text-primary-foreground/70 hover:text-primary-foreground',
              )}
            >
              <Icon className="size-5" strokeWidth={2.25} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
