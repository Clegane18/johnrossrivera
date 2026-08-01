"use client";

import dynamic from "next/dynamic";

// ChatWidget and ScrollToTop render nothing needed for SEO or first paint: ScrollToTop stays
// invisible until the page is scrolled 30% (useScrollPosition), and ChatWidget's panel opens only
// on interaction. `ssr: false` is only legal on next/dynamic from a Client Component, so this tiny
// wrapper exists purely to keep app/layout.tsx a Server Component while still code-splitting both
// (plus the framer-motion + chat-hook weight ChatWidget carries) out of the shared layout chunk
// that ships on every route.
const ScrollToTop = dynamic(
  () => import("./ScrollToTop").then((mod) => mod.ScrollToTop),
  { ssr: false }
);
const ChatWidget = dynamic(
  () => import("@/components/ui/ChatWidget").then((mod) => mod.ChatWidget),
  { ssr: false }
);

export function DeferredWidgets() {
  return (
    <>
      <ScrollToTop />
      <ChatWidget />
    </>
  );
}
