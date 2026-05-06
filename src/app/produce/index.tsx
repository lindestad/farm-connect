import { fetchAllFarmProfiles, type FarmProfile } from "@/lib/farmProfiles";
import { produceStyles } from "@/styles/produce-styles";
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

export default function FarmListScreen() {
  const router = useRouter();
  const [farms, setFarms] = useState<FarmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllFarmProfiles()
      .then(setFarms)
      .finally(() => setLoading(false));
  }, []);

  const filtered = farms.filter(
    (f) =>
      f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
      (f.city ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <SafeAreaView style={produceStyles.container}>
        <ActivityIndicator color="#2F6A3E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={produceStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={{ gap: 4 }}>
          <Text
            style={{
              color: "#2F6A3E",
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            FARMS
          </Text>
          <Text style={produceStyles.title}>Browse registered farms</Text>
        </View>

        {/* Search */}
        <TextInput
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#DDE4D9",
            borderRadius: 18,
            borderWidth: 1,
            color: "#182019",
            fontSize: 15,
            paddingHorizontal: 16,
            paddingVertical: 13,
          }}
          placeholder="Search by name or location"
          placeholderTextColor="#9AA89D"
          value={search}
          onChangeText={setSearch}
        />

        {/* Farm cards */}
        {filtered.length === 0 ? (
          <Text style={produceStyles.detail}>No farms found.</Text>
        ) : (
          filtered.map((farm) => (
            <Pressable
              key={farm.id}
              onPress={() => router.push(`/farm/${farm.id}`)}
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#DDE4D9",
                borderRadius: 24,
                borderWidth: 1,
                padding: 18,
                gap: 6,
                boxShadow: "0px 18px 30px rgba(24, 32, 25, 0.08)",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    backgroundColor: "#EEF5EB",
                    borderRadius: 999,
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#2F6A3E",
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    {farm.farm_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={produceStyles.produceName}>
                    {farm.farm_name}
                  </Text>
                  {farm.city ? (
                    <Text style={produceStyles.detail}>{farm.city}</Text>
                  ) : null}
                </View>
                <Text style={{ color: "#9AA89D", fontSize: 18 }}>›</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
