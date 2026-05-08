import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import produceData from "../data/produceData.json";
import { useAllFarmProfiles, useFarmProfile } from "../hooks/useFarmProfile";
import { fetchAllFarmsWithProduce } from "../lib/farmProduce";
import { type FarmProfile } from "../lib/farmProfiles";
import { useAuth } from "../providers/auth-provider";
import { homeStyles } from "../styles/home-styles";

type ProductDataItem = { id: string; name_nb: string; name_en: string | null };
const typedProduceData = produceData as { items: ProductDataItem[] };

const produceNameById = new Map<string, string>(
  typedProduceData.items.map((i) => [i.id, i.name_nb]),
);

function ScaleButton({
  onPress,
  style,
  textStyle,
  children,
}: {
  onPress: () => void;
  style?: object | object[];
  textStyle?: object;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        <Text style={textStyle}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

type FarmsByProduce = Map<string, string[]>; // produce_id -> [farm_id]

function FarmPickerModal({
  visible,
  produceName,
  farms,
  onClose,
  onPick,
}: {
  visible: boolean;
  produceName: string | null;
  farms: FarmProfile[];
  onClose: () => void;
  onPick: (farmId: string) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Available at:</Text>
          {produceName ? (
            <Text style={modalStyles.subtitle}>{produceName}</Text>
          ) : null}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {farms.length === 0 ? (
              <Text style={modalStyles.emptyText}>No farms found.</Text>
            ) : (
              farms.map((farm) => (
                <Pressable
                  key={farm.id}
                  accessibilityRole="button"
                  style={modalStyles.farmRow}
                  onPress={() => onPick(farm.id)}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={modalStyles.farmName}>{farm.farm_name}</Text>
                    {farm.city ? (
                      <Text style={modalStyles.farmCity}>{farm.city}</Text>
                    ) : null}
                  </View>
                  <Text style={modalStyles.chevron}>›</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            style={modalStyles.closeButton}
            onPress={onClose}
          >
            <Text style={modalStyles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function Index() {
  const { session, user, profile } = useAuth();
  const { farmProfile } = useFarmProfile(
    profile?.role === "farmer" ? user?.id : undefined,
  );
  const { farms } = useAllFarmProfiles();
  const router = useRouter();

  const [farmsWithProduce, setFarmsWithProduce] = useState<
    { farm_id: string; produce_ids: string[] }[] | null
  >(null);
  const [pickerProduceId, setPickerProduceId] = useState<string | null>(null);
  const [showcaseVisible, setShowcaseVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchAllFarmsWithProduce()
        .then((rows) => {
          if (!cancelled) setFarmsWithProduce(rows);
        })
        .catch(() => {
          if (!cancelled) setFarmsWithProduce([]);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  // Build produce_id -> farm_ids map and pick up to 8 unique produce_ids.
  const { uniqueProduceIds, farmsByProduce } = useMemo(() => {
    const byProduce: FarmsByProduce = new Map();
    if (farmsWithProduce) {
      for (const row of farmsWithProduce) {
        for (const pid of row.produce_ids) {
          if (!byProduce.has(pid)) byProduce.set(pid, []);
          byProduce.get(pid)!.push(row.farm_id);
        }
      }
    }
    const ids = Array.from(byProduce.keys()).slice(0, 8);
    return { uniqueProduceIds: ids, farmsByProduce: byProduce };
  }, [farmsWithProduce]);

  const firstName = user?.email?.split("@")[0] ?? null;
  const produceLoading = farmsWithProduce === null;

  const handleChipPress = (produceId: string) => {
    const farmIds = farmsByProduce.get(produceId) ?? [];
    if (farmIds.length === 1) {
      router.push(`/farm/${farmIds[0]}`);
    } else if (farmIds.length > 1) {
      setPickerProduceId(produceId);
    }
  };

  const pickerFarms = pickerProduceId
    ? (farmsByProduce.get(pickerProduceId) ?? [])
        .map((fid) => farms.find((f) => f.id === fid))
        .filter((f): f is FarmProfile => Boolean(f))
    : [];

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <StatusBar style="dark" />
      <View style={homeStyles.page}>
        <View style={[homeStyles.blob, homeStyles.blobLeft]} />
        <View style={[homeStyles.blob, homeStyles.blobRight]} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={homeStyles.scrollContent}
        >
          <View style={homeStyles.shell}>
            {/* Hero */}
            <View style={homeStyles.heroCard}>
              <Text style={homeStyles.heroTitle}>
                {session && firstName
                  ? `Welcome back, ${firstName} 👋`
                  : "Welcome to FarmConnect 👋"}
              </Text>
              <Text style={homeStyles.heroSubtitle}>
                Your local farm marketplace
              </Text>
              <Text style={homeStyles.heroTagline}>
                Browse · Reserve · Pickup
              </Text>
              <View style={homeStyles.actionRow}>
                <ScaleButton
                  onPress={() => router.push("/produce")}
                  style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                  textStyle={homeStyles.ctaLinkTextPrimary}
                >
                  Browse Produce
                </ScaleButton>
                {profile?.role === "farmer" ? (
                  <ScaleButton
                    onPress={() => router.push("/farmer_dashboard/market")}
                    style={homeStyles.ctaLink}
                    textStyle={homeStyles.ctaLinkText}
                  >
                    See market days
                  </ScaleButton>
                ) : null}
              </View>
            </View>

            {/* Produce — seasonal box driven by real farm_produce data */}
            <View style={homeStyles.sectionCard}>
              <Text style={homeStyles.eyebrow}>Produce</Text>
              <Text style={homeStyles.cardTitle}>{"What's available"}</Text>
              {produceLoading ? (
                <View style={homeStyles.produceGrid}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        homeStyles.produceChip,
                        {
                          backgroundColor: "#E6ECE3",
                          minWidth: 70,
                          height: 30,
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : uniqueProduceIds.length === 0 ? (
                <Text style={homeStyles.cardBody}>
                  No produce currently in season.
                </Text>
              ) : (
                <View style={homeStyles.produceGrid}>
                  {uniqueProduceIds.map((pid) => (
                    <ScaleButton
                      key={pid}
                      onPress={() => handleChipPress(pid)}
                      style={homeStyles.produceChip}
                      textStyle={homeStyles.produceChipText}
                    >
                      {produceNameById.get(pid) ?? pid}
                    </ScaleButton>
                  ))}
                </View>
              )}
              <ScaleButton
                onPress={() => router.push("/produce")}
                style={[homeStyles.ctaLink, homeStyles.ctaLinkSecondary]}
                textStyle={homeStyles.ctaLinkTextSecondary}
              >
                See all produce
              </ScaleButton>
            </View>

            {/* Account */}
            <View style={homeStyles.sectionCard}>
              <Text style={homeStyles.eyebrow}>Account</Text>
              <Text style={homeStyles.cardTitle}>
                {session
                  ? "Your session is active."
                  : "Create an account to get started."}
              </Text>
              <Text style={homeStyles.cardBody}>
                {session
                  ? `Signed in as ${user?.email ?? "an existing user"}.`
                  : "Register or sign in to reserve produce and manage pickups."}
              </Text>
              <View style={homeStyles.actionRow}>
                {session ? (
                  <>
                    <ScaleButton
                      onPress={() => router.push("/account")}
                      style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                      textStyle={homeStyles.ctaLinkTextPrimary}
                    >
                      Open account
                    </ScaleButton>
                    {profile?.role === "farmer" ? (
                      <ScaleButton
                        onPress={() =>
                          router.push(
                            farmProfile
                              ? `/farm/${farmProfile.id}`
                              : "/farm/edit",
                          )
                        }
                        style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                        textStyle={homeStyles.ctaLinkTextPrimary}
                      >
                        {farmProfile ? "Farm management" : "Create a farm"}
                      </ScaleButton>
                    ) : null}
                  </>
                ) : (
                  <>
                    <ScaleButton
                      onPress={() => router.push("/auth/register")}
                      style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                      textStyle={homeStyles.ctaLinkTextPrimary}
                    >
                      Create account
                    </ScaleButton>
                    <ScaleButton
                      onPress={() => router.push("/auth/login")}
                      style={homeStyles.ctaLink}
                      textStyle={homeStyles.ctaLinkText}
                    >
                      Sign in
                    </ScaleButton>
                  </>
                )}
              </View>
            </View>

            {/* Experimental tech showcase — re-entry surface for camera demos */}
            <View style={homeStyles.sectionCard}>
              <Text style={[homeStyles.eyebrow, { color: "#B43A2C" }]}>
                Experimental
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowcaseVisible(true)}
                style={experimentalStyles.button}
              >
                <Text style={experimentalStyles.buttonText}>
                  Experimental Tech Showcase
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>

      <FarmPickerModal
        visible={pickerProduceId !== null}
        produceName={
          pickerProduceId
            ? (produceNameById.get(pickerProduceId) ?? null)
            : null
        }
        farms={pickerFarms}
        onClose={() => setPickerProduceId(null)}
        onPick={(farmId) => {
          setPickerProduceId(null);
          router.push(`/farm/${farmId}`);
        }}
      />

      <Modal
        visible={showcaseVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setShowcaseVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>Tech showcase</Text>
            <Text style={modalStyles.subtitle}>
              These are features built as technical demos and not part of the
              production UX.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={modalStyles.farmRow}
              onPress={() => {
                setShowcaseVisible(false);
                router.push("/camera");
              }}
            >
              <Text style={[modalStyles.farmName, { flex: 1 }]}>
                Open camera
              </Text>
              <Text style={modalStyles.chevron}>›</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={modalStyles.farmRow}
              onPress={() => {
                setShowcaseVisible(false);
                router.push("/camera/uploads");
              }}
            >
              <Text style={[modalStyles.farmName, { flex: 1 }]}>
                Test — fetching images
              </Text>
              <Text style={modalStyles.chevron}>›</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={modalStyles.closeButton}
              onPress={() => setShowcaseVisible(false)}
            >
              <Text style={modalStyles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const experimentalStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#B43A2C",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 16,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D8DDD8",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    color: "#182019",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 21,
  },
  farmRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FBF5",
    borderColor: "#DDE4D9",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  farmName: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  farmCity: {
    color: "#5D6A60",
    fontSize: 13,
  },
  chevron: {
    color: "#9AA89D",
    fontSize: 18,
  },
  emptyText: {
    color: "#5D6A60",
    fontSize: 14,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#EEF5EB",
    borderColor: "#BFD2B9",
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  closeButtonText: {
    color: "#2F6A3E",
    fontSize: 15,
    fontWeight: "700",
  },
});
