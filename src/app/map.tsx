import { FarmList } from "@/components/FarmList";
import { useAllFarmProfiles } from "@/hooks/useFarmProfile";
import type { FarmProfile } from "@/lib/farmProfiles";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const { farms, loading } = useAllFarmProfiles();

  const farmsWithCoordinates = farms.filter(
    (farm) => farm.latitude !== null && farm.longitude !== null,
  );

  const focusFirstResult = useCallback(
    (farm: FarmProfile | null) => {
      if (
        !searchExpanded ||
        !farm ||
        farm.latitude === null ||
        farm.longitude === null
      ) {
        return;
      }

      mapRef.current?.animateToRegion(
        {
          latitude: farm.latitude,
          longitude: farm.longitude,
          latitudeDelta: 0.18,
          longitudeDelta: 0.18,
        },
        450,
      );
    },
    [searchExpanded],
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        // Setting the start position for the map, and zoom level. Approximately Kristiansand / Grimstad
        initialRegion={{
          latitude: 58.1467,
          longitude: 7.9956,
          // Zoom level
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
      <View
        pointerEvents="box-none"
        style={[
          styles.searchOverlay,
          searchExpanded && styles.searchOverlayExpanded,
        ]}
      >
        <FarmList
          collapsed={!searchExpanded}
          farms={farms}
          loading={loading}
          onCollapse={() => setSearchExpanded(false)}
          onExpand={() => setSearchExpanded(true)}
          onFirstResultChange={focusFirstResult}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchOverlay: {
    left: 16,
    position: "absolute",
    right: 16,
    top: 56,
  },
  searchOverlayExpanded: {
    bottom: 24,
  },
});
