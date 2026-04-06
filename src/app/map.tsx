import { mockFarmProfiles } from "@/lib/mockFarmProfiles";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 58.1467,
          longitude: 7.9956,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {mockFarmProfiles.map((farm) =>
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
