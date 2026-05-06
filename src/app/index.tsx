import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import produceData from "../data/produceData.json";
import { useFarmProfile } from "../hooks/useFarmProfile";
import { useAuth } from "../providers/auth-provider";
import { homeStyles } from "../styles/home-styles";

type ProductDataItem = { id: string; name_nb: string; name_en: string | null };
const typedProduceData = produceData as { items: ProductDataItem[] };

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
  const scale = new Animated.Value(1);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        <Text style={textStyle}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Index() {
  const { session, user, profile } = useAuth();
  const { farmProfile } = useFarmProfile(user?.id);
  const router = useRouter();

  const firstName = user?.email?.split("@")[0] ?? null;

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
                  onPress={() => router.push("/produce" as Href)}
                  style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                  textStyle={homeStyles.ctaLinkTextPrimary}
                >
                  Browse Produce
                </ScaleButton>
                <ScaleButton
                  onPress={() => router.push("/")}
                  style={homeStyles.ctaLink}
                  textStyle={homeStyles.ctaLinkText}
                >
                  See market days
                </ScaleButton>
              </View>
            </View>

            {/* Produce */}
            <View style={homeStyles.sectionCard}>
              <Text style={homeStyles.eyebrow}>Produce</Text>
              <Text style={homeStyles.cardTitle}>{"What's available"}</Text>
              <View style={homeStyles.produceGrid}>
                {typedProduceData.items.slice(0, 8).map((item) => (
                  <ScaleButton
                    key={item.id}
                    onPress={() => router.push("/produce" as Href)}
                    style={homeStyles.produceChip}
                    textStyle={homeStyles.produceChipText}
                  >
                    {item.name_nb}
                  </ScaleButton>
                ))}
              </View>
              <ScaleButton
                onPress={() => router.push("/produce" as Href)}
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
                      onPress={() => router.push("/account" as Href)}
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
                              ? (`/farm/${farmProfile.id}` as Href)
                              : ("/farm/edit" as Href),
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
                      onPress={() => router.push("/auth/register" as Href)}
                      style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                      textStyle={homeStyles.ctaLinkTextPrimary}
                    >
                      Create account
                    </ScaleButton>
                    <ScaleButton
                      onPress={() => router.push("/auth/login" as Href)}
                      style={homeStyles.ctaLink}
                      textStyle={homeStyles.ctaLinkText}
                    >
                      Sign in
                    </ScaleButton>
                  </>
                )}
              </View>
            </View>

            {/* Camera */}
            <View style={homeStyles.sectionCard}>
              <Text style={homeStyles.eyebrow}>Camera</Text>
              <View style={homeStyles.actionRow}>
                <ScaleButton
                  onPress={() => router.push("../camera" as Href)}
                  style={[homeStyles.ctaLink, homeStyles.ctaLinkPrimary]}
                  textStyle={homeStyles.ctaLinkTextPrimary}
                >
                  Open camera
                </ScaleButton>
                <ScaleButton
                  onPress={() => router.push("../camera/uploads" as Href)}
                  style={homeStyles.ctaLink}
                  textStyle={homeStyles.ctaLinkText}
                >
                  Test - fetching image
                </ScaleButton>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
