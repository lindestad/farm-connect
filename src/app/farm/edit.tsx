import { geocodeAddress } from "@/lib/location/locationService";
import { AddressInput } from "@/lib/location/types";
import * as Location from "expo-location";
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
  const [farmLocation, setFarmLocation] = useState(""); // State for farm location
  const [isExisting, setIsExisting] = useState(false); // Track if we're editing an existing profile or creating a new one
  const [loading, setLoading] = useState(true); // Loading state for fetching existing profile
  const [saving, setSaving] = useState(false); // Saving state for when the user submits the form
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages
  const [address, setAddress] = useState<AddressInput>({
    country: "",
    region: "",
    city: "",
    postalCode: "",
    street: "",
  });
  const [, setLatitude] = useState<number | null>(null); // Set state for latitude
  const [, setLongitude] = useState<number | null>(null); // Set state for longitude

  // Fetch existing farm profile
  useEffect(() => {
    if (!user) return;

    fetchFarmProfileByUserId(user.id)
      .then((existing) => {
        if (existing) {
          setFarmName(existing.farm_name);
          setFarmBio(existing.farm_bio ?? "");
          setFarmLocation(existing.farm_location ?? "");
          setAddress({
            country: existing.country ?? "",
            region: existing.region ?? "",
            city: existing.city ?? "",
            postalCode: existing.postal_code ?? "",
            street: existing.street ?? "",
          });
          setLatitude(existing.latitude ?? null);
          setLongitude(existing.longitude ?? null);
          setIsExisting(true);
        }
      })
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Handle save action
  const handleSave = async () => {
    if (!user) return;
    if (
      !address.country.trim() ||
      !address.city.trim() ||
      !address.postalCode.trim() ||
      !address.street.trim()
    ) {
      setErrorMessage(
        "Please fill in all required fields. Required fields are marked with *.",
      );
      return;
    }
    try {
      setSaving(true);
      setErrorMessage(null);
      // Ask user for location permission
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setErrorMessage("Location permission was not granted.");
        return;
      }
      // Convert the AddressInput(address) into latitde and longitude
      const geocodeResult = await geocodeAddress(address);
      if (!geocodeResult.success || !geocodeResult.coordinates) {
        setErrorMessage(
          geocodeResult.error ??
            "Unable to convert address into latitude and longitude",
        );
        return;
      }
      const saved = await upsertFarmProfile(
        user.id,
        farmName,
        farmLocation,
        farmBio,
        address,
        geocodeResult.coordinates.latitude,
        geocodeResult.coordinates.longitude,
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
            <Text style={farmStyles.label}>Country*</Text>
            <TextInput
              onChangeText={(text) =>
                setAddress((prev) => ({
                  ...prev,
                  country: text,
                }))
              }
              placeholder="Country"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={address.country ?? ""}
            />
          </View>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>Region</Text>
            <TextInput
              onChangeText={(text) =>
                setAddress((prev) => ({
                  ...prev,
                  region: text,
                }))
              }
              placeholder="Region"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={address.region ?? ""}
            />
          </View>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>City*</Text>
            <TextInput
              onChangeText={(text) =>
                setAddress((prev) => ({
                  ...prev,
                  city: text,
                }))
              }
              placeholder="City"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={address.city ?? ""}
            />
          </View>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>Postal code*</Text>
            <TextInput
              onChangeText={(text) =>
                setAddress((prev) => ({
                  ...prev,
                  postalCode: text,
                }))
              }
              placeholder="Postal code"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={address.postalCode ?? ""}
            />
          </View>

          <View style={farmStyles.fieldGroup}>
            <Text style={farmStyles.label}>Street*</Text>
            <TextInput
              onChangeText={(text) =>
                setAddress((prev) => ({
                  ...prev,
                  street: text,
                }))
              }
              placeholder="Street"
              placeholderTextColor="#7A867D"
              style={farmStyles.input}
              value={address.street ?? ""}
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
