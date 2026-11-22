/**
 * Central API Configuration for Rentora Client.
 *
 * NOTE: Next.js inlines NEXT_PUBLIC_* variables at build time only when
 * referenced statically as `process.env.NEXT_PUBLIC_API_URL`.
 */

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const sanitizedApiUrl = (rawApiUrl ?? "").trim().replace(/\/+$/, "");

/**
 * Returns the configured API base URL, validating its presence.
 *
 * - In development: throws an immediate, descriptive error if missing.
 * - In production: logs an error to console and throws a friendly ApiConfigError
 *   so the UI layer can render a clean error state rather than crashing silently.
 */
export function getApiBaseUrl(): string {
  if (!sanitizedApiUrl) {
    const errorMessage =
      "NEXT_PUBLIC_API_URL is not configured. Please set NEXT_PUBLIC_API_URL in your environment (e.g. .env.local).";

    if (process.env.NODE_ENV !== "production") {
      throw new Error(`[Rentora Development Configuration Error]: ${errorMessage}`);
    } else {
      console.error(`[Rentora API Configuration Error]: ${errorMessage}`);
      throw new Error("The API service URL is not configured. Please contact support.");
    }
  }

  return sanitizedApiUrl;
}

/**
 * Static constant for the base URL (if available at initialization).
 */
export const API_BASE_URL = sanitizedApiUrl;
