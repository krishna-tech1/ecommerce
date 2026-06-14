/**
 * UTM Capture Utility
 * Captures UTM parameters from the URL query string and persists them in sessionStorage/localStorage
 * for attribution tracking in orders, checkouts, and analytics.
 */

export interface UtmParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  captured_at?: string;
}

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "ecommerce_utm_params";

/**
 * Capture UTM parameters from the current URL and save them to localStorage/sessionStorage.
 * Should be called in a client-side layout, hook, or page component.
 */
export function captureUtmParameters(): UtmParameters | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const captured: UtmParameters = {};
    let hasUtm = false;

    for (const key of UTM_PARAMS) {
      const val = urlParams.get(key);
      if (val) {
        captured[key] = val;
        hasUtm = true;
      }
    }

    if (hasUtm) {
      captured.captured_at = new Date().toISOString();
      // Store in localStorage for long-term attribution, and sessionStorage for session scope
      localStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
      return captured;
    }
  } catch (error) {
    console.error("Error capturing UTM parameters:", error);
  }

  return null;
}

/**
 * Retrieves the stored UTM parameters.
 */
export function getStoredUtmParameters(): UtmParameters | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UtmParameters;
    }
  } catch (error) {
    console.error("Error retrieving stored UTM parameters:", error);
  }

  return null;
}

/**
 * Clears stored UTM parameters.
 */
export function clearUtmParameters(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing UTM parameters:", error);
  }
}
