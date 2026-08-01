import { useEffect, useRef } from 'react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useMe } from '#/domain/user/query.ts'

export const Route = createFileRoute('/_authed/master')({ component: MasterLayout })

function MasterLayout() {
  const { data: user, isPending } = useMe()
  const navigate = useNavigate()
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (!isPending && user?.role !== 'MASTER' && !redirectedRef.current) {
      redirectedRef.current = true
      navigate({ to: '/' })
    }
  }, [isPending, user, navigate])

  if (isPending || user?.role !== 'MASTER') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return <Outlet />
}
