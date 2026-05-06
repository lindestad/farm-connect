import { Link, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { type FarmProfile } from "../lib/farmProfiles";
import { farmStyles } from "../styles/farm-styles";

type Props = {
  farms: FarmProfile[];
  loading: boolean;
  collapsed?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  onFirstResultChange?: (farm: FarmProfile | null) => void;
};

type SortMode = "distance" | "name" | "location";
type RadiusKm = 50 | 100 | "all";

const DEFAULT_CENTER = {
  latitude: 58.1467,
  longitude: 7.9956,
};

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: "Nearest", value: "distance" },
  { label: "Name", value: "name" },
  { label: "Location", value: "location" },
];

const RADIUS_OPTIONS: { label: string; value: RadiusKm }[] = [
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "All", value: "all" },
];

function distanceKm(farm: FarmProfile): number | null {
  if (farm.latitude === null || farm.longitude === null) return null;

  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(farm.latitude - DEFAULT_CENTER.latitude);
  const lonDelta = toRadians(farm.longitude - DEFAULT_CENTER.longitude);
  const originLat = toRadians(DEFAULT_CENTER.latitude);
  const farmLat = toRadians(farm.latitude);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(originLat) * Math.cos(farmLat) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function searchableText(farm: FarmProfile): string {
  return [
    farm.farm_name,
    farm.farm_location,
    farm.city,
    farm.region,
    farm.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function compareNullableText(left: string | null, right: string | null) {
  return (left ?? "").localeCompare(right ?? "");
}

export function FarmList({
  farms,
  loading,
  collapsed = false,
  onCollapse,
  onExpand,
  onFirstResultChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("distance");
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(100);

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    return farms
      .map((farm) => ({ farm, distance: distanceKm(farm) }))
      .filter(({ farm, distance }) => {
        const matchesQuery =
          !trimmedQuery || searchableText(farm).includes(trimmedQuery);
        const matchesRadius =
          radiusKm === "all" || (distance !== null && distance <= radiusKm);

        return matchesQuery && matchesRadius;
      })
      .sort((left, right) => {
        if (sortMode === "name") {
          return left.farm.farm_name.localeCompare(right.farm.farm_name);
        }

        if (sortMode === "location") {
          return (
            compareNullableText(
              left.farm.farm_location,
              right.farm.farm_location,
            ) || left.farm.farm_name.localeCompare(right.farm.farm_name)
          );
        }

        return (
          (left.distance ?? Number.POSITIVE_INFINITY) -
            (right.distance ?? Number.POSITIVE_INFINITY) ||
          left.farm.farm_name.localeCompare(right.farm.farm_name)
        );
      });
  }, [farms, query, radiusKm, sortMode]);

  const activeRadiusLabel =
    radiusKm === "all" ? "all distances" : `within ${radiusKm} km`;

  useEffect(() => {
    if (!onFirstResultChange) return;
    onFirstResultChange(loading ? null : (filtered[0]?.farm ?? null));
  }, [filtered, loading, onFirstResultChange]);

  if (collapsed) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onExpand}
        style={farmStyles.mapSearchBar}
        testID="farm-search-bar"
      >
        <Text style={farmStyles.mapSearchPlaceholder}>
          Search farms or locations
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={farmStyles.panel}>
      <View style={farmStyles.panelHeaderRow}>
        <View style={farmStyles.panelHeaderCopy}>
          <Text style={farmStyles.listEyebrow}>Farms</Text>
          <Text style={farmStyles.panelTitle}>Browse registered farms</Text>
        </View>
        {onCollapse ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCollapse}
            style={farmStyles.closeButton}
          >
            <Text style={farmStyles.closeButtonText}>Close</Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        onChangeText={setQuery}
        placeholder="Search by name or location"
        placeholderTextColor="#7A867D"
        style={farmStyles.searchInput}
        value={query}
      />
      <View style={farmStyles.filterGroup}>
        <Text style={farmStyles.filterLabel}>Sort</Text>
        <View style={farmStyles.filterRow}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => setSortMode(option.value)}
              style={[
                farmStyles.filterChip,
                sortMode === option.value && farmStyles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  farmStyles.filterChipText,
                  sortMode === option.value && farmStyles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={farmStyles.filterGroup}>
        <Text style={farmStyles.filterLabel}>Distance</Text>
        <View style={farmStyles.filterRow}>
          {RADIUS_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => setRadiusKm(option.value)}
              style={[
                farmStyles.filterChip,
                radiusKm === option.value && farmStyles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  farmStyles.filterChipText,
                  radiusKm === option.value && farmStyles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {loading ? (
        <ActivityIndicator color="#2F6A3E" />
      ) : filtered.length === 0 ? (
        <Text style={farmStyles.emptyText}>No farms found.</Text>
      ) : (
        <>
          <Text style={farmStyles.resultMeta}>
            Showing {filtered.length} of {farms.length} farms,{" "}
            {activeRadiusLabel}
          </Text>
          <ScrollView
            contentContainerStyle={farmStyles.resultListContent}
            showsVerticalScrollIndicator={false}
            style={farmStyles.resultList}
          >
            {filtered.map(({ farm, distance }) => (
              <Link key={farm.id} href={`/farm/${farm.id}` as Href} asChild>
                <Pressable
                  style={farmStyles.readonlyItem}
                  testID="farm-list-item"
                >
                  <Text style={farmStyles.rowName}>{farm.farm_name}</Text>
                  {farm.farm_location ? (
                    <Text style={farmStyles.readonlyMeta}>
                      {farm.farm_location}
                    </Text>
                  ) : null}
                  {distance !== null ? (
                    <Text style={farmStyles.readonlyMeta}>
                      {Math.round(distance)} km from Kristiansand
                    </Text>
                  ) : null}
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
