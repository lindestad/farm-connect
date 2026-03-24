import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type ProfileRole = "customer" | "farmer";

export type UserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: ProfileRole;
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

const profileSelect = `
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
`;

export function normalizeProfileRole(value: unknown): ProfileRole {
  return value === "farmer" ? "farmer" : "customer";
}

export function normalizeFullName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: normalizeProfileRole(row.role),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchProfile(userId: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  return data ? mapProfile(data) : null;
}

export async function upsertProfileFromUser(user: User) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: normalizeFullName(user.user_metadata?.full_name),
        role: normalizeProfileRole(user.user_metadata?.role),
      },
      {
        onConflict: "id",
      },
    )
    .select(profileSelect)
    .single<ProfileRow>();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}
