import {
  mapProfile,
  normalizeFullName,
  normalizeOptionalText,
  normalizePreferredContactMethod,
  normalizeProfileRole,
  type ProfileRow,
} from "../src/lib/profiles";

// normalizeProfileRole
describe("normalizeProfileRole", () => {
  it("returns 'farmer' for 'farmer'", () => {
    expect(normalizeProfileRole("farmer")).toBe("farmer");
  });

  it("returns 'customer' for 'customer'", () => {
    expect(normalizeProfileRole("customer")).toBe("customer");
  });

  it("returns null for unknown string", () => {
    expect(normalizeProfileRole("admin")).toBeNull();
    expect(normalizeProfileRole("FARMER")).toBeNull();
  });

  it("returns null for non-string values", () => {
    expect(normalizeProfileRole(null)).toBeNull();
    expect(normalizeProfileRole(undefined)).toBeNull();
    expect(normalizeProfileRole(1)).toBeNull();
  });
});

// normalizeFullName
describe("normalizeFullName", () => {
  it("returns trimmed string for valid input", () => {
    expect(normalizeFullName("  Ada Lovelace  ")).toBe("Ada Lovelace");
  });

  it("returns the string unchanged when already clean", () => {
    expect(normalizeFullName("Ada Lovelace")).toBe("Ada Lovelace");
  });

  it("returns null for empty string", () => {
    expect(normalizeFullName("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(normalizeFullName("   ")).toBeNull();
  });

  it("returns null for non-string values", () => {
    expect(normalizeFullName(null)).toBeNull();
    expect(normalizeFullName(undefined)).toBeNull();
    expect(normalizeFullName(42)).toBeNull();
  });
});

// normalizeOptionalText
describe("normalizeOptionalText", () => {
  it("trims whitespace from valid strings", () => {
    expect(normalizeOptionalText("  hello  ")).toBe("hello");
  });

  it("returns null for empty or whitespace-only input", () => {
    expect(normalizeOptionalText("")).toBeNull();
    expect(normalizeOptionalText("   ")).toBeNull();
  });

  it("returns null for non-string values", () => {
    expect(normalizeOptionalText(null)).toBeNull();
    expect(normalizeOptionalText(undefined)).toBeNull();
  });
});

// normalizePreferredContactMethod
describe("normalizePreferredContactMethod", () => {
  it("returns 'phone' for 'phone'", () => {
    expect(normalizePreferredContactMethod("phone")).toBe("phone");
  });

  it("returns 'email' for 'email'", () => {
    expect(normalizePreferredContactMethod("email")).toBe("email");
  });

  it("defaults to 'email' for unknown values", () => {
    expect(normalizePreferredContactMethod("sms")).toBe("email");
    expect(normalizePreferredContactMethod(null)).toBe("email");
    expect(normalizePreferredContactMethod(undefined)).toBe("email");
  });
});

// mapProfile
const STUB_ROW: ProfileRow = {
  id: "user-1",
  email: "ada@example.com",
  display_name: "Ada",
  full_name: "Ada Lovelace",
  role: "farmer",
  phone_number: "+4712345678",
  bio: "Grows heritage tomatoes.",
  location_label: "Kristiansand",
  preferred_contact_method: "phone",
  default_pickup_notes: "Ring the bell.",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

describe("mapProfile", () => {
  it("maps all snake_case fields to camelCase UserProfile", () => {
    const profile = mapProfile(STUB_ROW);

    expect(profile.id).toBe("user-1");
    expect(profile.email).toBe("ada@example.com");
    expect(profile.displayName).toBe("Ada");
    expect(profile.fullName).toBe("Ada Lovelace");
    expect(profile.role).toBe("farmer");
    expect(profile.phoneNumber).toBe("+4712345678");
    expect(profile.bio).toBe("Grows heritage tomatoes.");
    expect(profile.locationLabel).toBe("Kristiansand");
    expect(profile.preferredContactMethod).toBe("phone");
    expect(profile.defaultPickupNotes).toBe("Ring the bell.");
    expect(profile.createdAt).toBe("2026-01-01T00:00:00Z");
    expect(profile.updatedAt).toBe("2026-06-01T00:00:00Z");
  });

  it("normalises unknown role to 'customer'", () => {
    const profile = mapProfile({ ...STUB_ROW, role: "superadmin" });
    expect(profile.role).toBe("customer");
  });

  it("normalises unknown preferred_contact_method to 'email'", () => {
    const profile = mapProfile({
      ...STUB_ROW,
      preferred_contact_method: "fax",
    });
    expect(profile.preferredContactMethod).toBe("email");
  });

  it("propagates null fields unchanged", () => {
    const profile = mapProfile({
      ...STUB_ROW,
      display_name: null,
      bio: null,
      phone_number: null,
    });
    expect(profile.displayName).toBeNull();
    expect(profile.bio).toBeNull();
    expect(profile.phoneNumber).toBeNull();
  });
});
