import { fetchAllFarmProfiles, type FarmProfile } from "@/lib/farmProfiles";
import { produceStyles } from "@/styles/produce-styles";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 5;

export default function FarmListScreen() {
  const router = useRouter();
  const [farms, setFarms] = useState<FarmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchAllFarmProfiles()
      .then(setFarms)
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      setVisibleCount(PAGE_SIZE);
    }, []),
  );

  // Reset pagination as the search term changes so a typed query never
  // shows a clipped 5-row slice of the original list.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const filtered = farms.filter(
    (f) =>
      f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
      (f.city ?? "").toLowerCase().includes(search.toLowerCase()),
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (loading) {
    return (
      <SafeAreaView style={produceStyles.container}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={backButtonStyle.button}
        >
          <Text style={backButtonStyle.text}>← Back</Text>
        </Pressable>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#2F6A3E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={produceStyles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={backButtonStyle.button}
      >
        <Text style={backButtonStyle.text}>← Back</Text>
      </Pressable>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
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
          <>
            {visible.map((farm) => (
              <Pressable
                accessibilityRole="button"
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
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
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
            ))}
            {hasMore ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisibleCount((n) => n + PAGE_SIZE)}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "#BFD2B9",
                  backgroundColor: "#EEF5EB",
                  minHeight: 52,
                  marginTop: 8,
                  paddingHorizontal: 18,
                }}
              >
                <Text
                  style={{
                    color: "#2F6A3E",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Load more ({filtered.length - visibleCount} remaining)
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const backButtonStyle = {
  button: {
    alignSelf: "flex-start" as const,
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    marginBottom: 12,
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
