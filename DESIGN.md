---
name: Smart Fridge
description: A phone-native tap-to-unlock checkout for a physical vending fridge — stock, pay, unlock, nothing else.
colors:
  ink: "#202020"
  paper: "#ffffff"
  cream: "#ffe8ae"
  mint: "#eafcd7"
  lavender: "#e8e9ff"
  blush: "#ffcdca"
  sand: "#f2e1d5"
  muted: "#f5f5f3"
  muted-foreground: "#6b6b68"
  border: "#ececea"
  destructive: "#d94f4f"
typography:
  display:
    fontFamily: "Rubik, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: "1.1"
  headline:
    fontFamily: "Rubik, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: "1.2"
  body:
    fontFamily: "Rubik, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "Rubik, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.3"
rounded:
  sm: "0.5rem"
  md: "0.875rem"
  lg: "1.25rem"
  xl: "1.6875rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  category-pill-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
  category-pill-inactive:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
  product-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "0"
  input-field:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "3rem"
    padding: "0 1rem"
---

# Design System: Smart Fridge

## Overview

**Creative North Star: "The Vending Wallet"**

Smart Fridge compresses a physical vending purchase into a single-handed phone flow: near-black ink typeset in Rubik's confident geometric weight sits on a cream-and-white ground, with pastel-coded tiles standing in for a product catalog that doesn't exist yet. There is no browsing chrome, no cart, no multi-step checkout — every screen is a full-bleed phone card carrying exactly one job (browse, decide, pay, unlock). The palette is loud in small, specific places (a pill button, a stock badge, a tone field) and otherwise gets out of the way of black text on white.

The system was brief-pinned from a Figma type/color spec sheet and three snack-vending app screens; the shipped build honors that pinning almost exactly — same ink/cream/pastel palette, same pill-everything form language, same stepper and bottom-tab patterns — with the one durable adaptation being PhoneShell, which turns the reference's implicit "this is a phone app" into an explicit, enforced layout rule for a real responsive web build.

**Key Characteristics:**
- Near-black ink (#202020) on white/cream grounds; color is reserved for tone fields, pills, and the primary CTA, never for body text.
- Rubik at heavy weights (700-800) for every heading; body and label text stay at regular/semibold Rubik.
- Pill radius (full) on every interactive control: buttons, category filters, nav, badges, quantity stepper.
- Large corner radius (1.25rem+) on every card, sheet, and product tile — nothing in the system has a sharp corner.
- One phone-shaped canvas per screen (PhoneShell), never a fluid desktop grid.

## Colors

The palette is a warm near-monochrome (ink/cream/white) carrying five pastel "tone" fields that exist to color-code product tiles, plus one destructive red for form errors.

### Primary
- **Ink** (`#202020`): the only text, icon-stroke, and primary-surface color in the system — page headings, body copy, primary button fill, active nav icon-well, active category pill. Carries `--primary` and `--foreground`.

### Secondary
- **Cream** (`#ffe8ae`): the login hero background and the `--secondary`/`--accent` semantic slot. Reserved for the one full-bleed warm surface in the flow (the sign-in screen), not used as a general accent.

### Tertiary (pastel tone fields)
- **Mint** (`#eafcd7`), **Lavender** (`#e8e9ff`), **Blush** (`#ffcdca`), **Sand** (`#f2e1d5`): the five-color rotation (mint/lavender/blush/sand/cream) assigned per-product as the tile background behind its placeholder icon, on both the browse grid and the product-detail hero. Also used once each as a full-screen state ground (mint on the unlock-success screen, cream on login) to signal a distinct, non-browsing moment.

### Neutral
- **Paper** (`#ffffff`): default page and card background (`--background`, `--card`).
- **Muted** (`#f5f5f3`): secondary surface for inactive pills, the account-avatar row, and input fill.
- **Muted foreground** (`#6b6b68`): secondary text — descriptions, category labels, timestamps.
- **Border** (`#ececea`): the single hairline/ring color, used sparingly on outline buttons and the PhoneShell edge.
- **Destructive** (`#d94f4f`): form-validation error text only.

### Named Rules
**The Ink-Only-Text Rule.** Body and heading text are always `--foreground` (near-black) or `--muted-foreground`; pastel tokens never carry text, only fills behind icons or full-screen state grounds.

**The One Pastel Per Surface Rule.** Any given tile or screen uses exactly one tone color as a flat fill — tones are never combined, gradiented, or layered on the same surface.

## Typography

**Display/Body Font:** Rubik (with `ui-sans-serif, system-ui, sans-serif` fallback) — the system's only typeface.

**Character:** A single geometric grotesk carries the whole system at two registers: extrabold (800) for anything that announces a screen or a number, and regular/semibold for anything supporting it. There is no serif, no mono, no second family.

### Hierarchy
- **Display** (800, `text-3xl`/`text-4xl`, tight leading): screen-level greetings and the login headline ("Hey, {name}", "Scan. Pick. Walk out.").
- **Headline** (800, `text-2xl`, tight leading): product-detail title, unlock-success confirmation, section titles like "Account".
- **Title** (700, `text-base`/`text-lg`, snug leading): product name on cards, account name.
- **Body** (400-500, `text-sm`, 1.5 leading): descriptions, form labels' helper text, muted supporting copy.
- **Label** (600-700, `text-xs`, normal case, no uppercase tracking): category pills, stock badges, form field labels, price tags. Notably never uppercase/letter-spaced — the system has no small-caps or tracked-label convention anywhere in the build.

### Named Rules
**The Two-Weight Rule.** Every text element on screen resolves to either extrabold (numbers, headings, totals) or a lighter 400-600 weight (everything else) — there is no mid-weight (500-600 headline) register in use.

## Layout

Smart Fridge is a phone-only product (the customer's own phone/browser, reached via QR code — see PRODUCT.md), and the layout system is built around that as an enforced constraint, not a fallback. `PhoneShell` is the sole layout primitive: below the `sm` breakpoint it renders full-bleed (`min-h-dvh`, edge-to-edge); at `sm` and above it centers the same content in a fixed `max-w-md` card (`sm:rounded-[2.5rem]`, ambient shadow, 1px border ring) floating on a muted gray page background. This means the product never adopts a fluid desktop grid — wide viewports get a static phone silhouette, not a reflowed layout. Every route (`login`, browse, product detail, unlock, account) mounts through this single shell.

Screen padding is consistently `px-6` (1.5rem) with generous top padding (`pt-12`, ~3rem) to clear the phone's status-bar area. Content that must clear the floating bottom nav reserves `pb-32`. The browse grid is a fixed two-column (`grid-cols-2`) layout with `gap-x-4 gap-y-6` — this is the system's only multi-column arrangement; every other screen is single-column and vertically stacked.

## Elevation & Depth

The system is mostly flat — ink-on-paper cards and pills carry no shadow — with shadow reserved structurally for two floating elements that must read as detached from the page: the PhoneShell itself (on wide viewports, signaling "this is a device") and the floating pill bottom nav (signaling "this sits above content"). A soft shadow also lifts the description chip that overlaps the product-detail hero image.

### Shadow Vocabulary
- **Shell elevation** (`box-shadow: 0 24px 60px -24px rgba(0,0,0,0.25)`): the PhoneShell card at `sm+`, distinguishing the device silhouette from the muted page behind it.
- **Nav float** (`box-shadow: 0 12px 32px -8px rgba(0,0,0,0.35)`): the bottom pill nav, keeping it visually above scrolling content.
- **Chip lift** (`box-shadow: 0 8px 24px -6px rgba(0,0,0,0.18)`): the overlapping description chip on product detail.

### Named Rules
**The Structural-Only Shadow Rule.** Shadows appear only on elements that are physically floating above another layer (the shell, the nav, the overlapping chip) — cards, tiles, and buttons at rest are flat.

## Shapes

Every corner in the system is heavily rounded and nothing is sharp. `--radius: 1.25rem` is the base token, scaled into `--radius-sm` (0.5rem, small chips/inputs), `--radius-md` (0.875rem), `--radius-lg` (1.25rem, cards/tiles), and `--radius-xl` (1.6875rem, PhoneShell corners use an even larger literal `2.5rem`). Fully circular (`rounded-full`) is used for every tap target that is a control rather than a container: buttons, category pills, the quantity stepper, badges, avatar circles, and icon-only buttons (back, filter, nav items) at a consistent `size-11` (2.75rem) circle. Product tiles and the product-detail hero use the largest radii in the system (`rounded-3xl`/`rounded-[2rem]`), reinforcing that image-bearing surfaces get the softest geometry. Borders are a single hairline (`border-border`, 1px) used only on outline buttons and input containers — never as a decorative device.

## Components

### Buttons
- **Shape:** fully circular ends (`rounded-full`); icon-only utility buttons are perfect circles at `size-11`.
- **Primary:** ink fill, cream/paper text, `h-13`–`h-14` height, used for the sign-in CTA, "Make Payment", and "Done". The payment CTA embeds a circular icon well (`bg-primary-foreground`) at its leading edge — a distinctive pill-with-badge composition unique to the pay action.
- **Outline:** transparent fill, `border-border` hairline, ink text — used for icon-only secondary actions (filter, back, sign-out) and never carries a text label without an icon.
- **Hover/Focus:** default shadcn ring/opacity treatment (`focus-visible:ring-ring/50`, `disabled:opacity-50`); no custom hover choreography beyond opacity shifts on the primary payment button while processing.

### Chips / Pills (signature pattern)
- **Category pills:** horizontally scrollable row, `rounded-full`, `bg-muted`/muted-foreground text when inactive, `bg-primary`/primary-foreground when active — the system's filter control.
- **Sign-in/sign-up segmented pill:** two-button toggle inside a `rounded-full bg-muted p-1` track, active segment gets the ink fill — the same active/inactive pill logic reused as a mode switch.
- **Stock badge:** small `rounded-full bg-background/80` chip overlaid on a product tile corner, shown only when stock ≤ 3 ("N left").
- **Location chip:** `rounded-full bg-muted` chip pairing a map-pin icon with the fridge location, under the browse greeting.

### Cards / Containers
- **Corner Style:** `rounded-3xl` (product tiles, account info row) to `rounded-[2rem]` (product hero).
- **Background:** paper for the product-card info area; one pastel tone fill (mint/lavender/blush/sand/cream) for the image-bearing portion of a tile.
- **Shadow Strategy:** flat at rest (see Elevation & Depth); no card in the system has a resting shadow.
- **Border:** none — cards are distinguished by fill color against the page background, not by outline.
- **Internal Padding:** tiles use no internal padding around the tone field (edge-to-edge square); text below sits at `px-0.5 pt-2.5`. Larger containers (account row) use `p-5`.

### Inputs / Fields
- **Style:** borderless, `bg-muted` fill, `rounded-2xl` (0.875rem+), `h-12`, label set above in small semibold muted-foreground text.
- **Focus:** shadcn default ring (`focus-visible:ring-[3px] ring-ring/50`) plus border-color shift, inherited from the primitive but not visually customized further.
- **Error:** destructive-red inline text below the form, no field-level red border observed.

### Navigation
- **Bottom tab bar:** a floating pill (`rounded-full bg-primary`) fixed above the safe area, containing two circular icon targets (Home, Account) at `size-11`; the active destination gets an inverted (paper-fill, ink-icon) circle, inactive icons sit at 70% opacity primary-foreground. Exactly two destinations — no more were added after the duplicate-destination fix.
- **Header back/filter controls:** circular outline buttons in the top corners of a screen, never a text-labeled back button.

### Product Tile (signature component)
A square pastel-tone field with a centered `lucide-react` line icon (stroke 1.5, `size-14`–`size-28` depending on context) standing in for product photography, topped optionally by a stock-remaining pill. Below the tile: product name (semibold), muted description, and bold price in a two-column split. This icon-on-pastel pattern is a disclosed placeholder — see Do's and Don'ts.

## Do's and Don'ts

### Do:
- **Do** keep every route inside `PhoneShell` — full-bleed under `sm`, centered `max-w-md` card with `2.5rem` corners and ambient shadow at `sm+`. This is the system's responsive strategy, not a temporary constraint.
- **Do** use `rounded-full` for every tappable control (buttons, pills, badges, nav, stepper) and reserve large-but-not-full radii (`rounded-3xl`/`rounded-[2rem]`) for image-bearing containers.
- **Do** assign one pastel tone (mint/lavender/blush/sand/cream) per product/state as a flat fill — never gradient or combine tones on one surface.
- **Do** keep shadows structural: only on the shell, the floating nav, and elements that visually overlap another layer.
- **Do** set headings and numerals in Rubik 800; leave everything else at 400-600.

### Don't:
- **Don't** introduce a fluid, multi-column desktop layout — this is a phone-only product by design (PRODUCT.md), and PhoneShell's fixed-card behavior at wide viewports is the intended terminal state, not a gap to "fix" with a responsive grid.
- **Don't** put text on a pastel tone field — tones are backgrounds for icon placeholders and full-screen state grounds only, never a text-bearing surface.
- **Don't** add a third bottom-nav destination or duplicate an existing destination (Home/Account) — the nav was deliberately reduced to two non-overlapping destinations.
- **Don't** add uppercase, letter-spaced "kicker" or eyebrow labels above headings — the type system has no tracked small-caps register anywhere in the shipped build; labels are inline chips/pills, not standalone eyebrow text.
- **Don't** add hard-offset, outlined "neobrutalist" shadows (flat black offset borders) — this world's only shadow vocabulary is soft, diffuse, and structural (see Elevation & Depth); it is not a neobrutalist system.
