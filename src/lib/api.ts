import { getApiBaseUrl } from "./apiConfig";

export type UserRole = "renter" | "owner" | "admin" | "customer";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  phone?: string;
  address?: string;
  authProvider?: "email" | "google" | "github";
  status?: "active" | "suspended" | "deactivated";
  createdAt?: string;
};

export type Equipment = {
  _id: string;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  location: string;
  image: string;
  quantity: number;
  condition: string;
  availability: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  owner?: Pick<User, "_id" | "name" | "email">;
};

export type Booking = {
  _id: string;
  equipmentId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  pricePerDay: number;
  totalDays: number;
  totalAmount: number;
  phone: string;
  address: string;
  notes?: string;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
  renter?: Pick<User, "_id" | "name" | "email">;
  owner?: Pick<User, "_id" | "name" | "email">;
  equipment?: Pick<Equipment, "_id" | "title">;
};

export type AdminOverview = {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingEquipmentApprovals: number;
  completedRentals: number;
  totalRevenue: number;
  confirmedBookingValue: number;
  monthlyBookings: { month: string; bookings: number }[];
};

export type PaymentTransaction = {
  transactionId: string;
  bookingId: string;
  renterId: string;
  amount: number;
  paymentMethod?: "demo_card" | "bkash_demo" | "nagad_demo";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  currency?: string;
  status: "pending" | "success" | "failed" | "cancelled" | "refunded";
  createdAt: string;
};

export type Review = {
  _id: string;
  equipmentId: string;
  bookingId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer?: {
    name?: string;
    image?: string;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 10000;

export async function apiRequest<T>(
  path: string,
  { method = "GET", token, body, signal }: ApiRequestOptions = {},
): Promise<T> {
  let baseUrl = "";
  try {
    baseUrl = getApiBaseUrl();
  } catch (configError) {
    throw new ApiError(
      configError instanceof Error ? configError.message : "API base URL is not configured.",
      0,
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException("Request timed out after 10 seconds", "TimeoutError"));
  }, DEFAULT_TIMEOUT_MS);

  const onCallerAbort = () => {
    controller.abort(signal?.reason);
    clearTimeout(timer);
  };

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      controller.abort(signal.reason);
    } else {
      signal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      cache: "no-store",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onCallerAbort);

    if (error instanceof DOMException && error.name === "AbortError" && signal?.aborted) {
      throw error;
    }
    if (
      (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) ||
      (error instanceof Error && error.message.toLowerCase().includes("timed out"))
    ) {
      throw new ApiError("The request timed out. Please check your connection and try again.", 408);
    }
    throw new ApiError(
      "Unable to reach the Rentora server. Check your connection or verify the server is running.",
      0,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onCallerAbort);
  }

  let payload: ApiEnvelope<T> | null = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = (await response.json()) as ApiEnvelope<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload?.success) {
    const message =
      payload && typeof payload.message === "string" && payload.message.trim()
        ? payload.message
        : response.status >= 500
          ? "The server encountered an error processing your request."
          : `The server returned an unexpected response (${response.status} ${response.statusText}).`;
    throw new ApiError(message, response.status);
  }

  return payload.data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 && /\btoken has expired\b/i.test(error.message)) {
      return "Your session has expired. Please sign in again.";
    }
    if (error.status === 403) return "You don’t have permission to perform this action.";
    if (error.status === 404) return "The requested record could not be found.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatAmount(value: number): string {
  return Number.isFinite(value)
    ? new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    : "—";
}
