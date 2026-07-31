import { useEffect, useRef } from 'react'
import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client.ts'

export const Route = createFileRoute('/_authed')({ component: AuthedLayout })

function AuthedLayout() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (!isPending && !session && !redirectedRef.current) {
      redirectedRef.current = true
      navigate({ to: '/login', search: { redirect: location.href } })
    }
  }, [isPending, session, navigate, location.href])

  if (isPending || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return <Outlet />
}
