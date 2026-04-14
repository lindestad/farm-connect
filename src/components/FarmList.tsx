import { Link, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { type FarmProfile } from "../lib/farmProfiles";
import { farmStyles } from "../styles/farm-styles";

type Props = {
  farms: FarmProfile[];
  loading: boolean;
};

export function FarmList({ farms, loading }: Props) {
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
          <Link key={farm.id} href={`/farm/${farm.id}` as Href} asChild>
            <Pressable style={farmStyles.readonlyItem}>
              <Text style={farmStyles.rowName}>{farm.farm_name}</Text>
              {farm.farm_location ? (
                <Text style={farmStyles.readonlyMeta}>
                  {farm.farm_location}
                </Text>
              ) : null}
            </Pressable>
          </Link>
        ))
      )}
    </View>
  );
}
