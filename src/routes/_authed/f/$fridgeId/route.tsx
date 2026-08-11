import { useState } from "react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BottomNav } from "#/components/site/bottom-nav.tsx";
import { CartBadge } from "#/components/site/cart-badge.tsx";
import { CartFlyOverlay } from "#/components/site/cart-fly-overlay.tsx";
import { PhoneShellFrame } from "#/components/site/phone-shell.tsx";
import { useCart } from "#/domain/cart/store.tsx";

export const Route = createFileRoute("/_authed/f/$fridgeId")({
  component: FridgeLayout,
});

function subPath(pathname: string) {
  const rest = pathname.replace(/^.*\/f\/[^/]+/, "");
  return rest.replace(/^\/|\/$/g, "");
}

function routeDepth(sub: string) {
  return sub.split("/").filter(Boolean).length;
}

function FridgeLayout() {
  const { fridgeId } = Route.useParams();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const sub = subPath(location.pathname);
  const depth = routeDepth(sub);
  const isIndex = sub === "";

  const [prevDepth, setPrevDepth] = useState(depth);
  const [direction, setDirection] = useState(0);
  if (depth !== prevDepth) {
    setDirection(depth > prevDepth ? 1 : -1);
    setPrevDepth(depth);
  }

  const cart = useCart();

  return (
    <PhoneShellFrame className="overflow-x-hidden">
      {shouldReduceMotion ? (
        <Outlet />
      ) : (
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={location.pathname}
            custom={direction}
            initial={{ opacity: 0, x: direction * 200 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-0 left-0 w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      )}

      <CartFlyOverlay flights={cart.flights} onComplete={cart.completeFly} />
      {isIndex && <CartBadge fridgeId={fridgeId} />}
      {isIndex && <BottomNav fridgeId={fridgeId} />}
    </PhoneShellFrame>
  );
}
