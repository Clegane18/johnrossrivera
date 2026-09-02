import type { ChatFallback } from "@/types";

// GRACEFUL DEGRADATION FOR THE CHAT.
//
// The chat runs on a finite daily token budget. When it runs out — or the API is down, or the
// network drops — the visitor is very often a recruiter. A red "!" error box reads as a broken site,
// which on a hiring artifact costs more than having no chat at all.
//
// So an outage is treated as a ROUTING problem, not an error: say plainly what happened and hand
// the visitor the thing they actually came for — a way to reach John. The conversion path must
// survive the outage. State the cause without apologising for it; a recruiter wants the email
// address, not contrition.
//
// The split that matters:
//   canRetry   — the visitor can fix this themselves by trying again (bad payload, dropped network).
//   showContact — the chat itself is unavailable; offer the email route instead of a dead end.
// A message can be both: a transient 5xx is worth retrying AND worth offering an escape hatch.

export function chatFallback(
  status: number | null,
  serverMessage?: string | null
): ChatFallback {
  // Network / no response at all.
  if (status === null) {
    return {
      message:
        "I can't reach the server right now. Check your connection and try again.",
      canRetry: true,
      showContact: false,
    };
  }

  // Out of chat budget, either this visitor's hourly cap or the daily one across everyone.
  // The route already returns a warm, on-brand message for both, so prefer it when present.
  if (status === 429) {
    return {
      message:
        serverMessage ??
        "Nuggets has hit its message limit for now. It resets shortly — or reach John directly below.",
      canRetry: true,
      showContact: true,
    };
  }

  // Server-side fault: a missing key, a provider outage. Nothing the visitor can do about it, so
  // lead with the escape hatch rather than asking them to keep trying.
  if (status >= 500) {
    return {
      message:
        "Nuggets can't reach the model right now. You can still reach John directly.",
      canRetry: true,
      showContact: true,
    };
  }

  // 4xx that is not a rate limit: the message itself was rejected. Retrying a different message
  // genuinely can work, and the chat is up — so no need to route them away from it.
  //
  // The server's copy is DELIBERATELY ignored here. Only the 429 branch above forwards it, because
  // those are the only responses written for a visitor to read. A 400 body says "Validation failed."
  // and ships a Zod issue array — developer copy. This path is reachable in normal use: paste a
  // message over the 2000-character cap and the schema rejects it, so a recruiter would otherwise be
  // shown a validation error from the API.
  return {
    message:
      "That message didn't quite come through — it may be too long. Mind trying a shorter one?",
    canRetry: true,
    showContact: false,
  };
}
