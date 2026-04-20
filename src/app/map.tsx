import { useAllFarmProfiles } from "@/hooks/useFarmProfile";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  const router = useRouter();

  // Loading farms with a hook for farm-profiles.
  const { farms } = useAllFarmProfiles();

  // Filtering out farms without coordinates
  const farmsWithCoordinates = farms.filter(
    (farm) => farm.latitude !== null && farm.longitude !== null,
  );
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        // Setting the start possision for the map, and zoom level. Approximatly Kristiansand / Grimstad
        initialRegion={{
          latitude: 58.1467,
          longitude: 7.9956,
          // Zoom leval
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {farmsWithCoordinates.map((farm) =>
          typeof farm.latitude === "number" &&
          typeof farm.longitude === "number" ? (
            <Marker
              key={farm.id}
              coordinate={{
                latitude: farm.latitude,
                longitude: farm.longitude,
              }}
              title={farm.farm_name}
              description={farm.farm_bio ?? ""}
              onPress={() => router.push(`/farm/${farm.id}`)}
            />
          ) : null,
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
