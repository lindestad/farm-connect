import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

type UploadedImageRows = {
    id: string;
    image_url: string;
    image_path: string;
    created_at: string;
}

export default function CameraUploadScreen() {
    // Store the uploaded rows from supabase, starts with empty array.
    const [uploads, setUploads] = useState<UploadedImageRows[]>([]);

    // Store a simple loading state for first fetch.
    const [loading, setLoading] = useState(true);

    // Store fetched error message.
    const [errorMessage, setErrorMessage] = useState<string | null> (null);

    useEffect(() => {
        const fetchUploads = async () => {
        try {
            if(!supabase){
                setErrorMessage("Supabase is not configured");
                setLoading(false);
                return;
            }

            // Fetch uploaded image rows from temporary table.
            const { data, error} = await supabase
            .from("image_uploads_development")
            .select("id, image_url, image_path, created_at")
            .order("created_at", {ascending: false })

            if(error){
                setErrorMessage(error.message);
                setLoading(false);
                return;
            }
            // Store uploaded image rows in state, or empty array 
            setUploads(data ?? []);
            // If anything inside try fails, set error
        } catch (error){
          setErrorMessage("Unexpected error while fetching uploads.");
          console.error("Unexpected error while fetching uploads:", error);
          // Stop loading state after request finishes. 
        }finally{
        setLoading(false)
        }  
    };

    fetchUploads();
},[]);
  if (loading){
    return(
        <View style={styles.centered}>
            <Text>Loading uploads...</Text>
        </View>
    );
  }

  if (errorMessage){
    return(
        <View style={styles.centered}>
            <Text>{errorMessage}</Text>
        </View>
    )
  }
  return(
    <ScrollView contentContainerStyle={styles.container}>
        {uploads.length === 0 ? (
            <Text>No uploaded images found.</Text>
        ) : (
            uploads.map((upload) => (
                <View key={upload.id} style={styles.card}>
                    <Image 
                    source={{ uri: upload.image_url }}
                    style={styles.image}
                    onLoad={() => console.log("Image loaded:", upload.image_url)}
                    onError={(event) => console.log("Image failed to load", upload.image_url, event.nativeEvent)}
                    />

                    <Text style={styles.label}>Path:</Text>
                    <Text style={styles.value}>{upload.image_path}</Text>

                    <Text style={styles.label}>Created:</Text>
                    <Text style={styles.value}>{upload.created_at}</Text>
                </View>
            ))
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    card: {
        gap: 8,
        paddingBottom: 16,
        borderBottomWidth: 1, 
    },
    image: {
        width: "100%",
        height: 250,
    },
    label: {
        fontWeight: "600",
    },
    value: {
        marginBottom: 4,
    },
})