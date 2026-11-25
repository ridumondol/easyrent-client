"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notifications, AppToaster } from "@/lib/notifications";
import { apiRequest, ApiError, type User } from "@/lib/api";

type Credentials = { email: string; password: string };
type Registration = Credentials & { name: string; role: "renter" | "owner"; image?: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<User>;
  register: (input: Registration) => Promise<User>;
  googleLogin: (credential: string) => Promise<User>;
  githubLogin: (code: string) => Promise<User>;
  rotateToken: (nextToken: string) => void;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

type AuthResponse = { user: User; token: string };
type ProfileResponse = { user: User };

const TOKEN_KEY = "easyrent_token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (activeToken: string) => {
    const result = await apiRequest<ProfileResponse>("/auth/me", { token: activeToken });
    setUser(result.user);
    setError(null);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(async () => {
        const savedToken = window.localStorage.getItem(TOKEN_KEY);
        if (!savedToken) {
          if (active) setLoading(false);
          return;
        }

        if (active) setToken(savedToken);
        try {
          const { user: profile } = await apiRequest<ProfileResponse>("/auth/me", {
            token: savedToken,
          });
          if (active) {
            setUser(profile);
            setError(null);
          }
        } catch (requestError) {
          if (!active) return;
          if (requestError instanceof ApiError && requestError.status === 401) {
            window.localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
            setError(null);
          } else {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Unable to verify your session.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to verify your session.",
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const result = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setError(null);
    notifications.success("Welcome back!");
    return result.user;
  }, []);

  const register = useCallback(async (input: Registration) => {
    const result = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
    });
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setError(null);
    notifications.success("Your Rentora account is ready.");
    return result.user;
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const result = await apiRequest<AuthResponse>("/auth/google", {
      method: "POST",
      body: { credential },
    });
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setError(null);
    notifications.success("Signed in with Google.");
    return result.user;
  }, []);

  const githubLogin = useCallback(async (code: string) => {
    const result = await apiRequest<AuthResponse>("/auth/github", {
      method: "POST",
      body: { code },
    });
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setError(null);
    notifications.success("Signed in with GitHub.");
    return result.user;
  }, []);

  const rotateToken = useCallback((nextToken: string) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await apiRequest("/auth/logout", { token });
    } finally {
      window.localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, [token]);

  const reloadUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await loadProfile(token);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to verify your session.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadProfile, token]);

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, googleLogin, githubLogin, rotateToken, logout, reloadUser }),
    [user, token, loading, error, login, register, googleLogin, githubLogin, rotateToken, logout, reloadUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AppToaster />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
