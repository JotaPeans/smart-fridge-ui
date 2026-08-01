import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { BarChart3, LogOut, Refrigerator, Receipt, ShieldCheck } from 'lucide-react'
import { authClient } from '#/lib/auth-client.ts'
import { useMe } from '#/domain/user/query.ts'
import { cn } from '#/lib/utils.ts'

const NAV_ITEMS = [
  { to: '/master', label: 'Geladeiras', icon: Refrigerator },
  { to: '/master/sales', label: 'Vendas', icon: Receipt },
  { to: '/master/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/master/admins', label: 'Admins', icon: ShieldCheck },
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: user } = useMe()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  async function handleSignOut() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-dvh bg-muted">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background px-4 py-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Refrigerator className="size-4.5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-foreground">
              Geladeira Inteligente
            </p>
            <p className="text-xs font-semibold text-muted-foreground">Painel Master</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = to === '/master' ? pathname === '/master' : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4.5" strokeWidth={2.25} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-3 rounded-2xl bg-muted px-3.5 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user?.name?.[0]?.toUpperCase() ?? user?.email[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name ?? 'Master'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <LogOut className="size-4" strokeWidth={2.25} />
            Sair
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  )
}
