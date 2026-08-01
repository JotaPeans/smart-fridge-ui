# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The customer standing at (or near) a physical smart fridge, using their own phone or browser — typically reached by scanning a QR code on the fridge — to browse what's currently stocked, pay, and unlock a product. This is the `USER` role and the only persona the product served until the admin back office below.

The `MASTER` operator — a small internal team, on desktop, managing the fleet of physical fridges: provisioning new fridges, assigning each to an `ADMIN` owner, managing per-fridge product catalogs, reading cross-fleet sales and analytics, and doing light support (manually opening a door for maintenance, deactivating a broken fridge or bad listing). This persona never shops; it operates the system the `USER` persona shops through.

The backend also defines an `ADMIN` role (owns and manages a subset of fridges) between `USER` and `MASTER`. No `ADMIN`-specific surface exists yet — out of scope until requested.

## Product Purpose

A self-service smart vending fridge: the customer views the products available in the fridge on this frontend, pays, the fridge door unlocks, the customer physically removes the product and closes the door again. Success is a fast, trustworthy unlock-and-purchase flow with no attendant needed.

## Positioning

Unlike a generic vending machine UI, this frontend is the customer-facing layer over a real smart fridge: it drives an actual door-lock controller and payment gateway, turning a phone browser into the checkout and unlock mechanism for a physical appliance.

## Operating Context

- Customer's own phone/browser is the only interaction surface (no kiosk screen on the fridge itself).
- Entry is expected via a QR code or link tied to a specific physical fridge/location.
- Flow: view available products in the fridge → pay → door unlocks → customer removes product → customer closes door.
- `MASTER` operates from a desktop working session, not a phone — a fleet-management back office, not a vending flow. It is auto-routed there by role immediately after login, never mixed into the customer screens.

## Capabilities and Constraints

- Integrates with an existing door lock controller API to unlock the fridge after payment.
- Integrates with an existing payment gateway to process the purchase before unlock.
- Backend/hardware integration already exists; this repo is the frontend.
- Stack: TanStack Start (React 19, file-based routing), Tailwind CSS v4, shadcn/ui, Better Auth for authentication.
- Full backend contract (all endpoints, roles, request/response shapes) is documented in `docs/api-docs.md`; MASTER's screens must trace to endpoints documented there, nothing invented.
- A fridge's `paymentCredential` is write-only on the backend — never returned by any response. The admin UI must never imply it knows or displays a current value.
- There is no self-service way to become `ADMIN` or `MASTER` — role promotion happens directly in the database/seed, not through this app.

## Brand Commitments

None confirmed yet.

## Evidence on Hand

No real product catalog, fridge/location data, pricing, or hardware API details are in this repo yet. Do not fabricate product names, prices, or hardware/payment API shapes — treat as undecided until provided.

## Product Principles

- Speed and trust over feature breadth: the entire job is see product, pay, get door open — every added step is friction against that.
- Design for one-handed phone use immediately after scanning a QR code, not a browsing/shopping-cart mental model.
- Treat the payment-to-unlock moment as the critical path; failure states there (payment ok but door fails to open, etc.) matter more than polish elsewhere.
- Never invent hardware/payment API behavior — confirm actual contracts before building against them.
