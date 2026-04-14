import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FarmHeroCard } from "../../components/FarmHeroCard";
import {
  deleteFarmProfile,
  type FarmProfile,
  fetchFarmProfileById,
} from "../../lib/farmProfiles";
import { useAuth } from "../../providers/auth-provider";
import { farmStyles } from "../../styles/farm-styles";

// Helper function to format ISO timestamps into a more readable format
function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Panel component to display farm details and actions for the owner
function FarmDetailsPanel({
  farmProfile,
  isOwner,
  onEdit,
  onDelete,
  deleting,
}: {
  farmProfile: FarmProfile;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <View style={farmStyles.panel}>
      <View style={farmStyles.sectionHeader}>
        <Text style={farmStyles.panelTitle}>Farm details</Text>
        {isOwner ? (
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            style={farmStyles.inlineButton}
          >
            <Text style={farmStyles.inlineButtonText}>Edit farm profile</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={farmStyles.readonlyGrid}>
        <View style={farmStyles.readonlyItem}>
          <Text style={farmStyles.readonlyLabel}>Created</Text>
          <Text style={farmStyles.readonlyMeta}>
            {formatTimestamp(farmProfile.created_at)}
          </Text>
        </View>
        <View style={farmStyles.readonlyItem}>
          <Text style={farmStyles.readonlyLabel}>Last updated</Text>
          <Text style={farmStyles.readonlyMeta}>
            {formatTimestamp(farmProfile.updated_at)}
          </Text>
        </View>
      </View>

      {farmProfile.farm_bio ? (
        <View style={farmStyles.textBlock}>
          <Text style={farmStyles.readonlyLabel}>About</Text>
          <Text style={farmStyles.longValue}>{farmProfile.farm_bio}</Text>
        </View>
      ) : null}

      {isOwner ? (
        <Pressable
          accessibilityRole="button"
          disabled={deleting}
          onPress={onDelete}
          style={[
            farmStyles.deleteButton,
            deleting && farmStyles.buttonDisabled,
          ]}
        >
          {deleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={farmStyles.deleteButtonText}>Delete Farm</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function FarmProfileScreen() {
  const { farmId } = useLocalSearchParams<{ farmId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFarmProfileById(farmId)
      .then(setFarmProfile)
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, [farmId]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Farm",
      "This will permanently remove your farm profile. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            try {
              setDeleting(true);
              await deleteFarmProfile(user.id);
              router.replace("/");
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Unable to delete farm profile.",
              );
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <ActivityIndicator color="#2F6A3E" />
      </SafeAreaView>
    );
  }

  if (errorMessage || !farmProfile) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <Text style={farmStyles.errorText}>
          {errorMessage ?? "Farm not found."}
        </Text>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === farmProfile.user_id;

  return (
    <SafeAreaView style={farmStyles.page}>
      <ScrollView
        contentContainerStyle={farmStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FarmHeroCard farmProfile={farmProfile} />
        <FarmDetailsPanel
          deleting={deleting}
          farmProfile={farmProfile}
          isOwner={isOwner}
          onEdit={() => router.replace("/farm/edit")}
          onDelete={handleDelete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
