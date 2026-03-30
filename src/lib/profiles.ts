import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type ProfileRole = "customer" | "farmer";
export type PreferredContactMethod = "email" | "phone";

export type UserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  fullName: string | null;
  role: ProfileRole;
  phoneNumber: string | null;
  bio: string | null;
  locationLabel: string | null;
  preferredContactMethod: PreferredContactMethod;
  defaultPickupNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  role: string;
  phone_number: string | null;
  bio: string | null;
  location_label: string | null;
  preferred_contact_method: string;
  default_pickup_notes: string | null;
  created_at: string;
  updated_at: string;
};

const profileSelect = `
  id,
  email,
  display_name,
  full_name,
  role,
  phone_number,
  bio,
  location_label,
  preferred_contact_method,
  default_pickup_notes,
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

export function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

export function normalizePreferredContactMethod(
  value: unknown,
): PreferredContactMethod {
  return value === "phone" ? "phone" : "email";
}

type UpdateProfileInput = {
  displayName: string;
  fullName: string;
  phoneNumber: string;
  bio: string;
  locationLabel: string;
  preferredContactMethod: PreferredContactMethod;
  defaultPickupNotes: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    fullName: row.full_name,
    role: normalizeProfileRole(row.role),
    phoneNumber: row.phone_number,
    bio: row.bio,
    locationLabel: row.location_label,
    preferredContactMethod: normalizePreferredContactMethod(
      row.preferred_contact_method,
    ),
    defaultPickupNotes: row.default_pickup_notes,
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
        display_name:
          normalizeOptionalText(user.user_metadata?.display_name) ??
          normalizeFullName(user.user_metadata?.full_name),
        full_name: normalizeFullName(user.user_metadata?.full_name),
        role: normalizeProfileRole(user.user_metadata?.role),
        phone_number: normalizeOptionalText(user.user_metadata?.phone_number),
        bio: normalizeOptionalText(user.user_metadata?.bio),
        location_label: normalizeOptionalText(
          user.user_metadata?.location_label,
        ),
        preferred_contact_method: normalizePreferredContactMethod(
          user.user_metadata?.preferred_contact_method,
        ),
        default_pickup_notes: normalizeOptionalText(
          user.user_metadata?.default_pickup_notes,
        ),
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

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: normalizeOptionalText(input.displayName),
      full_name: normalizeFullName(input.fullName),
      phone_number: normalizeOptionalText(input.phoneNumber),
      bio: normalizeOptionalText(input.bio),
      location_label: normalizeOptionalText(input.locationLabel),
      preferred_contact_method: normalizePreferredContactMethod(
        input.preferredContactMethod,
      ),
      default_pickup_notes: normalizeOptionalText(input.defaultPickupNotes),
    })
    .eq("id", userId)
    .select(profileSelect)
    .single<ProfileRow>();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}
