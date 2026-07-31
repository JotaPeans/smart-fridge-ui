import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '#/components/ui/sonner.tsx'
import { queryClient } from '#/lib/query-client.ts'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Geladeira Inteligente',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/*
          THESIS: a vending fridge's checkout compresses into a phone-native tap flow — no cart, no browsing, just stock, pay, unlock.
          OWN-WORLD: near-black ink on cream/white ground, Rubik display weight, pill CTAs, pastel-coded product tiles (mint/lavender/blush/sand).
          STORY: customer scans QR, sees what's stocked right now, taps a product, pays, and the door unlocks for pickup.
          FIRST VIEWPORT: greeting + fridge label at top, horizontal category pills, two-column product grid, floating pill tab bar.
          FORM: brief-pinned world from user-supplied reference images (typography/color sheet + 3 app screens); no concept roll run.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
        */}
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-center" richColors />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
