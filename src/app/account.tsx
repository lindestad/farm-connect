import { Link, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { type PreferredContactMethod, type UserProfile } from "../lib/profiles";
import { useAuth } from "../providers/auth-provider";

type CustomerProfileDraft = {
  displayName: string;
  fullName: string;
  phoneNumber: string;
  locationLabel: string;
  preferredContactMethod: PreferredContactMethod;
  bio: string;
  defaultPickupNotes: string;
};

const contactMethodOptions: {
  value: PreferredContactMethod;
  title: string;
  body: string;
}[] = [
  {
    value: "email",
    title: "Email",
    body: "Best for reminders, order updates, and routine communication.",
  },
  {
    value: "phone",
    title: "Phone",
    body: "Useful when pickup details change at short notice.",
  },
];

function formatTimestamp(value: string | null | undefined) {
  if (!value) {
    return "Unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Unavailable";
  }

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createCustomerDraft(
  profile: UserProfile | null,
): CustomerProfileDraft {
  return {
    displayName: profile?.displayName ?? profile?.fullName ?? "",
    fullName: profile?.fullName ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    locationLabel: profile?.locationLabel ?? "",
    preferredContactMethod: profile?.preferredContactMethod ?? "email",
    bio: profile?.bio ?? "",
    defaultPickupNotes: profile?.defaultPickupNotes ?? "",
  };
}

function AccountMetaCard({
  email,
  role,
  createdAt,
  updatedAt,
}: {
  email: string | null | undefined;
  role: string | null | undefined;
  createdAt: string | null | undefined;
  updatedAt: string | null | undefined;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Account details</Text>
      <View style={styles.readonlyGrid}>
        <View style={styles.readonlyItem}>
          <Text style={styles.readonlyLabel}>Email</Text>
          <Text style={styles.readonlyValue}>{email ?? "Unknown email"}</Text>
        </View>
        <View style={styles.readonlyItem}>
          <Text style={styles.readonlyLabel}>Account type</Text>
          <Text style={styles.readonlyValue}>
            {role === "farmer" ? "Farmer" : "Customer"}
          </Text>
        </View>
        <View style={styles.readonlyItem}>
          <Text style={styles.readonlyLabel}>Account created</Text>
          <Text style={styles.readonlyMeta}>{formatTimestamp(createdAt)}</Text>
        </View>
        <View style={styles.readonlyItem}>
          <Text style={styles.readonlyLabel}>Last updated</Text>
          <Text style={styles.readonlyMeta}>{formatTimestamp(updatedAt)}</Text>
        </View>
      </View>
    </View>
  );
}

function ProfileHeader({ profile }: { profile: UserProfile | null }) {
  const title = profile?.displayName ?? profile?.fullName ?? "Your profile";
  const isFarmer = profile?.role === "farmer";
  const subtitle = isFarmer
    ? "Farmer profiles will get their own editing flow in a later pass."
    : (profile?.locationLabel ??
      "Set a display name, contact preference, and pickup notes.");

  return (
    <View style={styles.heroCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {title
            .split(" ")
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "FC"}
        </Text>
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>
          {isFarmer ? "Farmer profile" : "Customer profile"}
        </Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroBody}>{subtitle}</Text>
      </View>
    </View>
  );
}

function CustomerProfileView({
  draft,
  isEditing,
  loading,
  onCancel,
  onEdit,
  onSave,
  onChange,
}: {
  draft: CustomerProfileDraft;
  isEditing: boolean;
  loading: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  onChange: <K extends keyof CustomerProfileDraft>(
    key: K,
    value: CustomerProfileDraft[K],
  ) => void;
}) {
  if (!isEditing) {
    return (
      <View style={styles.panel}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.panelTitle}>Customer profile</Text>
            <Text style={styles.panelBody}>
              This profile is shown as a customer account and stores the
              personal details that matter for reservations and pickup
              coordination.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            style={styles.inlineButton}
            testID="edit-profile-button"
          >
            <Text style={styles.inlineButtonText}>Edit customer profile</Text>
          </Pressable>
        </View>

        <View style={styles.readonlyGrid}>
          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Display name</Text>
            <Text style={styles.readonlyValue}>
              {draft.displayName || "Not set"}
            </Text>
          </View>
          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Full name</Text>
            <Text style={styles.readonlyValue}>
              {draft.fullName || "Not set"}
            </Text>
          </View>
          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Phone number</Text>
            <Text style={styles.readonlyValue}>
              {draft.phoneNumber || "Not set"}
            </Text>
          </View>
          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Location</Text>
            <Text style={styles.readonlyValue}>
              {draft.locationLabel || "Not set"}
            </Text>
          </View>
          <View style={styles.readonlyItem}>
            <Text style={styles.readonlyLabel}>Preferred contact</Text>
            <Text style={styles.readonlyValue}>
              {draft.preferredContactMethod === "phone" ? "Phone" : "Email"}
            </Text>
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.readonlyLabel}>Bio</Text>
          <Text style={styles.longValue}>
            {draft.bio || "No bio added yet."}
          </Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.readonlyLabel}>Pickup notes</Text>
          <Text style={styles.longValue}>
            {draft.defaultPickupNotes || "No pickup notes saved yet."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Edit customer profile</Text>
      <Text style={styles.panelBody}>
        Keep this focused on the details a farm needs when preparing a
        reservation for you.
      </Text>

      <View style={styles.formGrid}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            onChangeText={(value) => onChange("displayName", value)}
            placeholder="How you want to appear in the app"
            placeholderTextColor="#7A867D"
            style={styles.input}
            value={draft.displayName}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            onChangeText={(value) => onChange("fullName", value)}
            placeholder="Your full name"
            placeholderTextColor="#7A867D"
            style={styles.input}
            value={draft.fullName}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={(value) => onChange("phoneNumber", value)}
            placeholder="Optional phone number"
            placeholderTextColor="#7A867D"
            style={styles.input}
            value={draft.phoneNumber}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            onChangeText={(value) => onChange("locationLabel", value)}
            placeholder="Town, village, or area"
            placeholderTextColor="#7A867D"
            style={styles.input}
            value={draft.locationLabel}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Preferred contact method</Text>
        <View style={styles.optionGrid}>
          {contactMethodOptions.map((option) => {
            const active = draft.preferredContactMethod === option.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={option.value}
                onPress={() => onChange("preferredContactMethod", option.value)}
                style={[styles.optionCard, active && styles.optionCardActive]}
                testID={`contact-method-${option.value}`}
              >
                <Text
                  style={[
                    styles.optionTitle,
                    active && styles.optionTitleActive,
                  ]}
                >
                  {option.title}
                </Text>
                <Text
                  style={[styles.optionBody, active && styles.optionBodyActive]}
                >
                  {option.body}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          multiline
          onChangeText={(value) => onChange("bio", value)}
          placeholder="Tell farms a bit about how you shop or collect orders"
          placeholderTextColor="#7A867D"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={draft.bio}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Pickup notes</Text>
        <TextInput
          multiline
          onChangeText={(value) => onChange("defaultPickupNotes", value)}
          placeholder="Examples: call on arrival, small blue car, collect after 17:00"
          placeholderTextColor="#7A867D"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={draft.defaultPickupNotes}
        />
      </View>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={onSave}
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          testID="save-profile-button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Save profile</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={onCancel}
          style={styles.secondaryButton}
          testID="cancel-profile-button"
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FarmerProfileView() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Farmer profile</Text>
      <Text style={styles.panelBody}>
        Farmer accounts will get a separate profile editor once farm-specific
        fields are designed. This customer profile form is intentionally not
        shown here.
      </Text>
    </View>
  );
}

export default function AccountScreen() {
  const {
    profile,
    profileError,
    profileLoading,
    signOut,
    updateOwnProfile,
    user,
  } = useAuth();
  const [draft, setDraft] = useState<CustomerProfileDraft>(
    createCustomerDraft(profile),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const customerDraft = isEditing ? draft : createCustomerDraft(profile);

  const resetDraft = () => {
    setDraft(createCustomerDraft(profile));
  };

  const handleCustomerFieldChange = <K extends keyof CustomerProfileDraft>(
    key: K,
    value: CustomerProfileDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleEdit = () => {
    resetDraft();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetDraft();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      await updateOwnProfile(draft);
      setSuccessMessage("Customer profile updated.");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setErrorMessage(null);
      await signOut();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader profile={profile} />

        <AccountMetaCard
          createdAt={profile?.createdAt}
          email={user?.email}
          role={profile?.role}
          updatedAt={profile?.updatedAt}
        />

        {profileLoading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color="#2F6A3E" />
            <Text style={styles.panelBody}>Loading profile...</Text>
          </View>
        ) : profile?.role === "farmer" ? (
          <FarmerProfileView />
        ) : (
          <CustomerProfileView
            draft={customerDraft}
            isEditing={isEditing}
            loading={saving}
            onCancel={handleCancel}
            onChange={handleCustomerFieldChange}
            onEdit={handleEdit}
            onSave={handleSave}
          />
        )}

        {profileError ? (
          <Text style={styles.errorText}>{profileError}</Text>
        ) : null}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Pressable
            accessibilityRole="button"
            disabled={signingOut}
            onPress={handleSignOut}
            style={[
              styles.primaryButton,
              styles.signOutButton,
              signingOut && styles.buttonDisabled,
            ]}
            testID="sign-out-button"
          >
            {signingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign out</Text>
            )}
          </Pressable>
          <Text style={styles.footerText}>
            <Link href={"/" as Href} style={styles.footerLink}>
              Back to landing page
            </Link>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = {
  boxShadow: "0px 18px 40px rgba(26, 41, 30, 0.08)",
} as const;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  heroCard: {
    backgroundColor: "#21432D",
    borderRadius: 28,
    gap: 16,
    padding: 22,
    ...shadow,
  },
  avatarCircle: {
    alignItems: "center",
    backgroundColor: "#F3E6BB",
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: "#21432D",
    fontSize: 22,
    fontWeight: "800",
  },
  heroCopy: {
    gap: 6,
  },
  eyebrow: {
    color: "#B9D1BF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  heroBody: {
    color: "#D8E2DB",
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    ...shadow,
  },
  loadingPanel: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 18,
    ...shadow,
  },
  panelTitle: {
    color: "#182019",
    fontSize: 18,
    fontWeight: "800",
  },
  panelBody: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 21,
  },
  sectionHeader: {
    gap: 12,
  },
  sectionCopy: {
    gap: 4,
  },
  readonlyGrid: {
    gap: 12,
  },
  readonlyItem: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  readonlyLabel: {
    color: "#5D6A60",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  readonlyValue: {
    color: "#182019",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  readonlyMeta: {
    color: "#445148",
    fontSize: 14,
    lineHeight: 20,
  },
  textBlock: {
    gap: 6,
  },
  longValue: {
    color: "#213025",
    fontSize: 15,
    lineHeight: 22,
  },
  inlineButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  inlineButtonText: {
    color: "#214C2D",
    fontSize: 13,
    fontWeight: "700",
  },
  formGrid: {
    gap: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 18,
    borderWidth: 1,
    color: "#182019",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 110,
  },
  optionGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  optionCardActive: {
    backgroundColor: "#EEF5EB",
    borderColor: "#2F6A3E",
  },
  optionTitle: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  optionTitleActive: {
    color: "#214C2D",
  },
  optionBody: {
    color: "#5D6A60",
    fontSize: 13,
    lineHeight: 20,
  },
  optionBodyActive: {
    color: "#3A5441",
  },
  actionRow: {
    gap: 10,
    marginTop: 4,
  },
  bottomRow: {
    gap: 12,
    marginBottom: 8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2F6A3E",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#BFD2B9",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#2F6A3E",
    fontSize: 15,
    fontWeight: "700",
  },
  signOutButton: {
    backgroundColor: "#314A37",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: "#2E5B3C",
    fontSize: 14,
    lineHeight: 20,
  },
  footerText: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 22,
  },
  footerLink: {
    color: "#2F6A3E",
    fontWeight: "700",
  },
});
