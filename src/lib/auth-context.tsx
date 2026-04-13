"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types — identical shape to the prior localStorage implementation so every
// call site (Header, checkout, account, etc.) keeps working unchanged.
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// DB ↔ UI field mapping. Supabase stores snake_case; the app uses camelCase.
// ─────────────────────────────────────────────────────────────────────────────

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  phone: string | null;
};

type AddressRow = {
  id: string;
  user_id: string;
  type: "shipping" | "billing";
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
};

const toAddress = (row: AddressRow): Address => ({
  id: row.id,
  type: row.type,
  firstName: row.first_name ?? "",
  lastName: row.last_name ?? "",
  company: row.company ?? undefined,
  address1: row.address1,
  address2: row.address2 ?? undefined,
  city: row.city,
  state: row.state,
  zip: row.zip,
  country: row.country,
  isDefault: row.is_default,
});

const buildUser = (profile: ProfileRow, addresses: AddressRow[]): User => ({
  id: profile.id,
  email: profile.email,
  firstName: profile.first_name ?? "",
  lastName: profile.last_name ?? "",
  company: profile.company ?? undefined,
  phone: profile.phone ?? undefined,
  addresses: addresses.map(toAddress),
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch profile + addresses for an authenticated user and hydrate state.
  const hydrateUser = useCallback(
    async (userId: string) => {
      const [profileRes, addressesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single<ProfileRow>(),
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
      ]);

      if (profileRes.error || !profileRes.data) {
        // Profile row missing — the auth.users row exists but the trigger
        // didn't create (or we're reading against a stale DB). Treat as
        // signed-out rather than half-loaded.
        console.error("profiles fetch failed:", profileRes.error);
        setUser(null);
        return;
      }

      setUser(buildUser(profileRes.data, (addressesRes.data ?? []) as AddressRow[]));
    },
    [supabase],
  );

  // Load initial session and subscribe to auth state changes.
  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (data.user) {
        await hydrateUser(data.user.id);
      }
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        await hydrateUser(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, hydrateUser]);

  // ───────────────────────────────────────────────────────────────────────────
  // Auth actions
  // ───────────────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error("login failed:", error?.message);
      return false;
    }
    await hydrateUser(data.user.id);
    return true;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // The on_auth_user_created trigger (see supabase/migrations/0001_init.sql)
        // reads these fields into the profiles row.
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company ?? null,
        },
      },
    });

    if (error || !authData.user) {
      console.error("register failed:", error?.message);
      return false;
    }

    // If email confirmation is ON in the Supabase dashboard, session will be
    // null here — the user has to click the email link before they can log in.
    // If it's OFF, we get a session immediately and hydrate.
    if (authData.session) {
      await hydrateUser(authData.user.id);
    }
    return true;
  };

  const logout = () => {
    supabase.auth.signOut().catch((err) => console.error("logout failed:", err));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Profile / address mutations — optimistic UI, fire-and-forget to the DB.
  // Mirrors the sync call-site signatures the legacy localStorage version had.
  // ───────────────────────────────────────────────────────────────────────────

  const updateUser = (patch: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    setUser(next);

    const dbPatch: Partial<ProfileRow> = {};
    if (patch.firstName !== undefined) dbPatch.first_name = patch.firstName;
    if (patch.lastName !== undefined) dbPatch.last_name = patch.lastName;
    if (patch.company !== undefined) dbPatch.company = patch.company ?? null;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone ?? null;

    if (Object.keys(dbPatch).length === 0) return;

    supabase
      .from("profiles")
      .update(dbPatch)
      .eq("id", user.id)
      .then(({ error }) => {
        if (error) console.error("profile update failed:", error);
      });
  };

  const addAddress = (address: Omit<Address, "id">) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const next: Address = { id, ...address };
    setUser({ ...user, addresses: [...user.addresses, next] });

    supabase
      .from("addresses")
      .insert({
        id,
        user_id: user.id,
        type: address.type,
        first_name: address.firstName,
        last_name: address.lastName,
        company: address.company ?? null,
        address1: address.address1,
        address2: address.address2 ?? null,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        is_default: address.isDefault ?? false,
      })
      .then(({ error }) => {
        if (error) console.error("address insert failed:", error);
      });
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    setUser({ ...user, addresses: user.addresses.filter((a) => a.id !== id) });

    supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("address delete failed:", error);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        addAddress,
        removeAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
