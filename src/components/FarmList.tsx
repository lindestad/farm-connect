import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAllFarmProfiles } from "../hooks/useFarmProfile";
import { farmStyles } from "../styles/farm-styles";

export function FarmList() {
  const router = useRouter();
  const { farms, loading } = useAllFarmProfiles();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? farms.filter(
        (f) =>
          f.farm_name.toLowerCase().includes(query.toLowerCase()) ||
          (f.farm_location ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : farms;

  return (
    <View style={farmStyles.panel}>
      <Text style={farmStyles.listEyebrow}>Farms</Text>
      <Text style={farmStyles.panelTitle}>Browse registered farms</Text>
      <TextInput
        onChangeText={setQuery}
        placeholder="Search by name or location"
        placeholderTextColor="#7A867D"
        style={farmStyles.searchInput}
        value={query}
      />
      {loading ? (
        <ActivityIndicator color="#2F6A3E" />
      ) : filtered.length === 0 ? (
        <Text style={farmStyles.emptyText}>No farms found.</Text>
      ) : (
        filtered.map((farm) => (
          <Pressable
            key={farm.id}
            accessibilityRole="button"
            onPress={() => router.push(`/farm/${farm.id}` as Href)}
            style={farmStyles.readonlyItem}
          >
            <Text style={farmStyles.rowName}>{farm.farm_name}</Text>
            {farm.farm_location ? (
              <Text style={farmStyles.readonlyMeta}>{farm.farm_location}</Text>
            ) : null}
          </Pressable>
        ))
      )}
    </View>
  );
}
