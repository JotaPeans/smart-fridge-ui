import { cn } from '#/lib/utils.ts'

export function PhoneShellFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="min-h-dvh bg-muted sm:flex sm:justify-center sm:py-10">
      <div
        className={cn(
          'relative min-h-dvh w-full bg-background sm:min-h-[calc(100dvh-5rem)] sm:max-w-md sm:rounded-[2.5rem] sm:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:ring-1 sm:ring-border',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function PhoneShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <PhoneShellFrame className={className}>{children}</PhoneShellFrame>
}
