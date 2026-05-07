import deleteImage from "@/lib/image-helpers/image-delete";
import { supabase } from "@/lib/supabase";
import { cameraStyles as styles } from "@/styles/camera-styles";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UploadedImageRows = {
  id: string;
  image_url: string;
  image_path: string;
  created_at: string;
};

const backButtonStyle = {
  button: {
    alignSelf: "flex-start" as const,
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center" as const,
  },
  text: {
    color: "#214C2D",
    fontSize: 14,
    fontWeight: "700" as const,
  },
};

export default function CameraUploadScreen() {
  const router = useRouter();
  // Store the uploaded rows from supabase, starts with empty array.
  const [uploads, setUploads] = useState<UploadedImageRows[]>([]);

  // Store a simple loading state for first fetch.
  const [loading, setLoading] = useState(true);

  // Store fetched error message.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        if (!supabase) {
          setErrorMessage("Supabase is not configured");
          setLoading(false);
          return;
        }

        // Fetch uploaded image rows from temporary table.
        const { data, error } = await supabase
          .from("image_uploads_development")
          .select("id, image_url, image_path, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
        // Store uploaded image rows in state, or empty array
        setUploads(data ?? []);
        // If anything inside try fails, set error
      } catch (error) {
        setErrorMessage("Unexpected error while fetching uploads.");
        console.error("Unexpected error while fetching uploads:", error);
        // Stop loading state after request finishes.
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleDelete = async (id: string, imagePath: string) => {
    try {
      await deleteImage(id, imagePath);

      setUploads((currentUploads) =>
        currentUploads.filter((upload) => upload.id !== id),
      );
    } catch (error) {
      console.error("Unexpected error while deleting image:", error);
      setErrorMessage("Failed to delete image");
    }
  };

  if (loading) {
    return (
      <View style={styles.uploadCentered}>
        <Text style={styles.uploadStatusText}>Loading uploads...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.uploadCentered}>
        <Text style={styles.uploadErrorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={backButtonStyle.button}
      >
        <Text style={backButtonStyle.text}>← Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.uploadContainer}>
        {uploads.length === 0 ? (
          <Text style={styles.uploadEmptyText}>No uploaded images found.</Text>
        ) : (
          uploads.map((upload) => (
            <View key={upload.id} style={styles.uploadCard}>
              <Image
                source={{ uri: upload.image_url }}
                style={styles.uploadImage}
              />

              <Text style={styles.uploadLabel}>Path:</Text>
              <Text style={styles.uploadValue}>{upload.image_path}</Text>

              <Text style={styles.uploadLabel}>Created:</Text>
              <Text style={styles.uploadValue}>{upload.created_at}</Text>

              <View style={styles.uploadButtonWrapper}>
                <Button
                  title="Delete"
                  onPress={() => handleDelete(upload.id, upload.image_path)}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
