/**
 * Meta Pixel Tracking Utility
 * Standard FBQ event dispatcher + Local Database event logging.
 */

export function trackMetaEvent(eventName: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const currentUrl = window.location.href;

  // 1. Call official Meta Pixel script if initialized
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).fbq) {
      if (payload) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fbq("track", eventName, payload);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fbq("track", eventName);
      }
    }
  } catch (err) {
    console.error("Meta Pixel official tracker error:", err);
  }

  // 2. Log event in Neon DB for visual admin dashboard
  fetch("/api/meta-pixel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName,
      url: currentUrl,
      payload,
    }),
  }).catch((err) => {
    console.error("Failed to log meta event to dashboard:", err);
  });
}
