import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchFarmProfileByUserId,
  upsertFarmProfile,
} from "../../lib/farmProfiles";
import { useAuth } from "../../providers/auth-provider";
import { farmStyles } from "../../styles/farm-styles";

export default function FarmEditScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [farmName, setFarmName] = useState(""); // State for farm name
  const [farmBio, setFarmBio] = useState(""); // New state for farm bio
  const [farmLocation, setFarmLocation] = useState(""); // New state for farm location
  const [isExisting, setIsExisting] = useState(false); // Track if we're editing an existing profile or creating a new one
  const [loading, setLoading] = useState(true); // Loading state for fetching existing profile
  const [saving, setSaving] = useState(false); // Saving state for when the user submits the form
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages

  // Fetch existing farm profile
  useEffect(() => {
    if (!user) return;

    fetchFarmProfileByUserId(user.id)
      .then((existing) => {
        if (existing) {
          setFarmName(existing.farm_name);
          setFarmBio(existing.farm_bio ?? "");
          setFarmLocation(existing.farm_location ?? "");
          setIsExisting(true);
        }
      })
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Handle save action
  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      setErrorMessage(null);
      const saved = await upsertFarmProfile(
        user.id,
        farmName,
        farmBio,
        farmLocation,
      );
      router.replace(`/farm/${saved.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save farm profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Only allow farmers to access this screen
  if (profile?.role !== "farmer") {
    return (
      <SafeAreaView style={farmStyles.page}>
        <Text style={farmStyles.errorText}>
          Only farmers can edit a farm profile.
        </Text>
      </SafeAreaView>
    );
  }

  // Show loading state while fetching existing profile
  if (loading) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <ActivityIndicator color="#2F6A3E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={farmStyles.page}>
      <ScrollView contentContainerStyle={farmStyles.scrollContent}>
        <View style={farmStyles.card}>
          <Text style={farmStyles.title}>
            {isExisting ? "Edit farm profile" : "Create farm profile"}
          </Text>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>Farm name</Text>
            <TextInput
              onChangeText={setFarmName}
              placeholder="Your farm's name"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={farmName}
            />
          </View>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>Location</Text>
            <TextInput
              onChangeText={setFarmLocation}
              placeholder="Town or area"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={farmLocation}
            />
          </View>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>Bio</Text>
            <TextInput
              multiline
              onChangeText={setFarmBio}
              placeholder="Tell customers about your farm"
              placeholderTextColor="#7A867D"
              style={[farmStyles.input, farmStyles.textArea]}
              textAlignVertical="top"
              value={farmBio}
            />
          </View>

          {errorMessage ? (
            <Text style={farmStyles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            disabled={saving}
            onPress={handleSave}
            style={[
              farmStyles.primaryButton,
              saving && farmStyles.buttonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={farmStyles.primaryButtonText}>
                {isExisting ? "Save changes" : "Create farm profile"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
