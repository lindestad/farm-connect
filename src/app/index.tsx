import { Link, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FarmList } from "../components/FarmList";
import { useAllFarmProfiles, useFarmProfile } from "../hooks/useFarmProfile";
import { isSupabaseConfigured, supabaseConfigError } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";

const heroStats = [
  {
    value: "Pickup slots",
    label: "Reserve a collection time before stock runs out.",
  },
  {
    value: "Saturday markets",
    label: "Farmers can publish weekly stall plans and opening hours.",
  },
  {
    value: "Fresh weekly",
    label: "Availability shifts with harvests, pickups, and market days.",
  },
];

const featureCards = [
  {
    title: "Reserve by timeslot",
    body: "Customers choose a pickup window at the farm instead of sending back-and-forth messages.",
    eyebrow: "Pickup",
  },
  {
    title: "Promote market days",
    body: "Farmers can advertise Saturday markets, list what they are bringing, and set start and end times.",
    eyebrow: "Markets",
  },
  {
    title: "Browse what is actually available",
    body: "Produce listings stay tied to weekly inventory so customers see fresh stock, not stale catalogs.",
    eyebrow: "Produce",
  },
  {
    title: "Prep orders with context",
    body: "Farmers see what needs packing, when customers arrive, and whether the handoff is at the farm or a market.",
    eyebrow: "Operations",
  },
];

const pickupSlots = [
  { title: "Thursday pickup", meta: "16:30 to 17:00", tone: "Oakridge Farm" },
  { title: "Friday pickup", meta: "17:00 to 18:30", tone: "Moss Lane Produce" },
  {
    title: "Saturday market",
    meta: "09:00 to 13:00",
    tone: "Green Square Market",
  },
];

const marketHighlights = [
  "Seasonal vegetables",
  "Eggs and dairy",
  "Fresh herbs",
];

const configuredSupabaseHighlights = [
  "Expo env wired",
  "Session persistence ready",
  "Auth can land next",
];

const missingSupabaseHighlights = [
  "Add .env.local",
  "Restart Expo after env changes",
  "Use publishable key only",
];

const customerFlow = [
  "Find a nearby farm or Saturday market",
  "Choose produce and reserve it",
  "Book a pickup or market collection time",
  "Show up when the order is ready",
];

const farmerFlow = [
  "Publish this week's produce",
  "Open farm pickup windows",
  "Create a Saturday market listing",
  "Pack and hand off orders on time",
];

const reservationStages = ["Reserved", "Packed", "Ready", "Collected"];

const saturdayMarkets = [
  { name: "Green Square", time: "Saturday 09:00 to 13:00" },
  { name: "River Barn Hall", time: "Saturday 10:00 to 14:00" },
  { name: "Northfield Yard", time: "Sunday 11:00 to 15:00" },
];

export default function Index() {
  const { width } = useWindowDimensions();
  const { session, user, profile } = useAuth();
  const { farmProfile } = useFarmProfile(user?.id);
  const { farms, loading: farmsLoading } = useAllFarmProfiles();
  const isWide = width >= 940;
  const isMedium = width >= 720;
  const phoneWidth = width < 390 ? 250 : 286;
  const phoneHeight = width < 390 ? 520 : 580;
  const previewHeight = width < 390 ? 590 : 660;
  const supabaseHighlights = isSupabaseConfigured
    ? configuredSupabaseHighlights
    : missingSupabaseHighlights;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.page}>
        <View style={[styles.blob, styles.blobLeft]} />
        <View style={[styles.blob, styles.blobRight]} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.shell}>
            <View style={[styles.heroCard, isWide && styles.heroCardWide]}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>
                  Farm pickup · Market days · Weekly harvest
                </Text>
                <Text style={styles.heroTitle}>
                  Order from the farm, pick up in a slot, or meet at Saturday
                  market.
                </Text>
                <Text style={styles.heroBody}>
                  FarmConnect helps small farms sell produce without messy
                  coordination. Customers reserve items, choose a collection
                  time, and keep track of where the handoff happens, whether
                  that is at the farm gate or a weekend market.
                </Text>
                <View style={styles.heroActionRow}>
                  <View style={[styles.ctaPill, styles.ctaPillPrimary]}>
                    <Text style={[styles.ctaText, styles.ctaTextPrimary]}>
                      Browse pickups
                    </Text>
                  </View>
                  <View style={styles.ctaPill}>
                    <Text style={styles.ctaText}>See market days</Text>
                  </View>
                </View>
                <View
                  style={[styles.statsRow, isMedium && styles.statsRowWide]}
                >
                  {heroStats.map((stat) => (
                    <View key={stat.value} style={styles.statCard}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View
                style={[
                  styles.previewColumn,
                  { minHeight: previewHeight },
                  isWide && styles.previewColumnWide,
                ]}
              >
                <View
                  style={[
                    styles.phoneFrame,
                    styles.phoneSecondary,
                    { width: phoneWidth, height: phoneHeight },
                  ]}
                >
                  <View style={styles.phoneNotch} />
                  <View style={styles.phoneScreen}>
                    <View style={styles.phoneHeaderSoft}>
                      <Text style={styles.phoneChip}>Customer</Text>
                      <Text style={styles.phoneHeading}>
                        Choose a collection plan
                      </Text>
                      <Text style={styles.phoneSubheading}>
                        Reserve produce, pick a time, and decide whether you
                        collect at the farm or at market.
                      </Text>
                    </View>
                    <View style={styles.phoneBody}>
                      {pickupSlots.map((slot) => (
                        <View key={slot.title} style={styles.mockCard}>
                          <View style={styles.produceRow}>
                            <View style={styles.produceThumb} />
                            <View style={styles.produceCopy}>
                              <Text style={styles.mockTitle}>{slot.title}</Text>
                              <Text style={styles.mockMeta}>{slot.meta}</Text>
                            </View>
                          </View>
                          <View style={styles.inlineBadge}>
                            <Text style={styles.inlineBadgeText}>
                              {slot.tone}
                            </Text>
                          </View>
                        </View>
                      ))}
                      <View style={[styles.mockCard, styles.marketCard]}>
                        <Text style={styles.marketEyebrow}>This Saturday</Text>
                        <Text style={styles.marketTitle}>
                          Green Square farm market
                        </Text>
                        <Text style={styles.mockMeta}>
                          6 farms, morning pickup queue, and pre-ordered baskets
                          ready at stall opening.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.phoneFrame,
                    styles.phonePrimary,
                    { width: phoneWidth, height: phoneHeight },
                  ]}
                >
                  <View style={styles.phoneNotch} />
                  <View style={styles.phoneScreen}>
                    <View style={styles.phoneHeaderStrong}>
                      <Text style={[styles.phoneChip, styles.phoneChipStrong]}>
                        Farmer
                      </Text>
                      <Text style={styles.phoneHeading}>
                        Saturday market setup
                      </Text>
                      <Text style={styles.phoneSubheading}>
                        Open a market day, cap pickup windows, and keep
                        pre-orders aligned with what the van can carry.
                      </Text>
                    </View>
                    <View style={styles.phoneBody}>
                      <View style={styles.mockCard}>
                        <Text style={styles.queueLabel}>Upcoming event</Text>
                        <Text style={styles.queueTitle}>
                          Green Square market opens at 09:00
                        </Text>
                        <View style={styles.queueMetaRow}>
                          <Text style={styles.queueMeta}>Reserved baskets</Text>
                          <Text style={styles.queueMetaValue}>
                            18 confirmed
                          </Text>
                        </View>
                      </View>
                      <View style={styles.statusRow}>
                        {reservationStages.map((status) => (
                          <View key={status} style={styles.statusChip}>
                            <Text style={styles.statusChipText}>{status}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={[styles.mockCard, styles.mockCardMuted]}>
                        <Text style={styles.mockTitle}>Bring to market</Text>
                        <Text style={styles.mockMeta}>
                          Carrots, lettuce, eggs, herb bundles, and 8 extra
                          mixed vegetable boxes.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>This Week</Text>
              <Text style={styles.sectionTitle}>
                Designed around real pickup habits, not abstract marketplace
                features.
              </Text>
              <Text style={styles.sectionBody}>
                The home screen now talks like the product should: reserve
                produce, choose a time slot, and watch for weekend markets where
                local farms gather in one place.
              </Text>
            </View>

            <View style={[styles.cardGrid, isMedium && styles.cardGridWide]}>
              {featureCards.map((card) => (
                <View key={card.title} style={styles.infoCard}>
                  <Text style={styles.infoEyebrow}>{card.eyebrow}</Text>
                  <Text style={styles.infoTitle}>{card.title}</Text>
                  <Text style={styles.infoBody}>{card.body}</Text>
                </View>
              ))}
            </View>

            <View style={styles.authStatusCard}>
              <Text style={styles.bootstrapEyebrow}>Account access</Text>
              <Text style={styles.bootstrapTitle}>
                {session
                  ? "Your FarmConnect session is active."
                  : "Create an account to reserve produce and manage pickups."}
              </Text>
              <Text style={styles.bootstrapBody}>
                {session
                  ? `Signed in as ${user?.email ?? "an existing user"}. Your session is persisted locally through Supabase auth storage.`
                  : "The app now has separate registration and login flows, plus an email-confirmation path that redirects back into the mobile app."}
              </Text>
              <View style={styles.heroActionRow}>
                {session ? (
                  <>
                    <Link
                      href={"/account" as Href}
                      style={[styles.ctaLink, styles.ctaLinkPrimary]}
                    >
                      Open account
                    </Link>
                    {profile?.role === "farmer" ? (
                      <Link
                        href={
                          farmProfile
                            ? (`/farm/${farmProfile.id}` as Href)
                            : ("/farm/edit" as Href)
                        }
                        style={[styles.ctaLink, styles.ctaLinkPrimary]}
                      >
                        {farmProfile ? "Farm management" : "Create a farm"}
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Link
                      href={"/auth/register" as Href}
                      style={[styles.ctaLink, styles.ctaLinkPrimary]}
                    >
                      Create account
                    </Link>
                    <Link href={"/auth/login" as Href} style={styles.ctaLink}>
                      Sign in
                    </Link>
                  </>
                )}
              </View>
            </View>

            <FarmList farms={farms} loading={farmsLoading} />

            <View style={styles.authStatusCard}>
              <Text style={styles.bootstrapEyebrow}>Payments</Text>
              <Text style={styles.bootstrapTitle}>Test the payment flow</Text>
              <Text style={styles.bootstrapBody}>
                Try out the Stripe payment sheet with a mock order from Solberg
                Gård.
              </Text>
              <View style={styles.heroActionRow}>
                <Link
                  href={"/order/order-screen" as Href}
                  style={[styles.ctaLink, styles.ctaLinkPrimary]}
                >
                  Go to order
                </Link>
                <Link
                  href={"/map"}
                  style={[styles.ctaLink, styles.ctaLinkPrimary]}
                >
                  Open map
                </Link>
                <Link
                  href={"/produce" as Href}
                  style={[styles.ctaLink, styles.ctaLinkPrimary]}
                >
                  Open produce list
                </Link>
                <Link
                  href={"../camera" as Href}
                  style={[styles.ctaLink, styles.ctaLinkPrimary]}
                >
                  Open camera
                </Link>
                <Link
                  href={"../camera/uploads"}
                  style={[styles.ctaLink, styles.ctaLinkPrimary]}
                >
                  Test - fetching image
                </Link>
              </View>
            </View>

            <View style={styles.band}>
              <View style={[styles.bandGrid, isMedium && styles.bandGridWide]}>
                <View style={styles.bandCopy}>
                  <Text style={styles.bandEyebrow}>Featured market</Text>
                  <Text style={styles.bandTitle}>
                    Saturday should feel like an event, not a logistics problem.
                  </Text>
                  <Text style={styles.bandBody}>
                    Farmers can publish one clear market listing with time,
                    location, and what is coming to the stall. Customers can
                    reserve before leaving home and collect in a predictable
                    window.
                  </Text>
                </View>
                <View style={styles.bandPanels}>
                  <View style={styles.bandPanel}>
                    <Text style={styles.bandPanelTitle}>
                      What customers see
                    </Text>
                    <Text style={styles.bandPanelBody}>
                      A market card, opening hours, available produce, and
                      pickup-ready reservations.
                    </Text>
                  </View>
                  <View style={styles.bandPanel}>
                    <Text style={styles.bandPanelTitle}>
                      What farmers manage
                    </Text>
                    <Text style={styles.bandPanelBody}>
                      Stall schedule, stock allocation, collection queue, and
                      who has already arrived.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>Paths</Text>
              <Text style={styles.sectionTitle}>
                The app supports both farm-gate pickup and weekend market
                traffic.
              </Text>
              <Text style={styles.sectionBody}>
                That gives the product two useful rhythms: weekday collection
                windows and recurring Saturday market planning.
              </Text>
            </View>

            <View style={[styles.flowGrid, isMedium && styles.flowGridWide]}>
              <View style={styles.flowCard}>
                <Text style={styles.flowTitle}>Customer path</Text>
                {customerFlow.map((step, index) => (
                  <View key={step} style={styles.flowStep}>
                    <Text style={styles.flowIndex}>0{index + 1}</Text>
                    <Text style={styles.flowText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.flowCardAccent}>
                <Text style={styles.flowTitleAccent}>Market board</Text>
                <Text style={styles.flowBodyAccent}>
                  Farmers can keep a rolling list of upcoming markets so
                  customers know where produce will be available next.
                </Text>
                <View style={styles.marketBoard}>
                  {saturdayMarkets.map((market) => (
                    <View key={market.name} style={styles.marketBoardRow}>
                      <Text style={styles.marketBoardTitle}>{market.name}</Text>
                      <Text style={styles.marketBoardMeta}>{market.time}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.flowCard}>
                <Text style={styles.flowTitle}>Farmer path</Text>
                {farmerFlow.map((step, index) => (
                  <View key={step} style={styles.flowStep}>
                    <Text style={styles.flowIndex}>0{index + 1}</Text>
                    <Text style={styles.flowText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.bootstrapCard}>
              <Text style={styles.bootstrapEyebrow}>Supabase bootstrap</Text>
              <Text style={styles.bootstrapTitle}>
                {isSupabaseConfigured
                  ? "Backend config is wired for Expo."
                  : "Supabase environment variables still need local setup."}
              </Text>
              <Text style={styles.bootstrapBody}>
                {isSupabaseConfigured
                  ? "The app now has a reusable Supabase client with persisted auth sessions, so the next pass can add sign-in, role-aware onboarding, and real data queries."
                  : `${supabaseConfigError} Add the values to .env.local and restart Expo so the app can initialize the client.`}
              </Text>
              <View style={styles.footerChipRow}>
                {supabaseHighlights.map((item) => (
                  <View key={item} style={styles.bootstrapChip}>
                    <Text style={styles.bootstrapChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footerCard}>
              <Text style={styles.footerEyebrow}>Coming into the app</Text>
              <Text style={styles.footerTitle}>
                Weekly harvests, pickup notes, and market-ready reservations.
              </Text>
              <Text style={styles.footerBody}>
                The next backend pass can wire these sections into Supabase so
                farmers can publish real slots, add Saturday market events, and
                accept reservations against live inventory.
              </Text>
              <View style={styles.footerChipRow}>
                {marketHighlights.map((item) => (
                  <View key={item} style={styles.footerChip}>
                    <Text style={styles.footerChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const shadow = {
  boxShadow: "0px 18px 30px rgba(24, 32, 25, 0.08)",
} as const;

const cardShadow = {
  boxShadow: "0px 10px 18px rgba(24, 32, 25, 0.05)",
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F3",
  },
  page: {
    flex: 1,
    backgroundColor: "#F6F7F3",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  shell: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    gap: 28,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9,
  },
  blobLeft: {
    width: 260,
    height: 260,
    top: -60,
    left: -80,
    backgroundColor: "#EAF3E3",
  },
  blobRight: {
    width: 220,
    height: 220,
    top: 120,
    right: -70,
    backgroundColor: "#FFF3DD",
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 32,
    padding: 22,
    gap: 26,
    ...shadow,
  },
  heroCardWide: {
    flexDirection: "row",
    alignItems: "center",
    padding: 28,
  },
  heroCopy: {
    flex: 1,
    gap: 18,
  },
  heroEyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF5EB",
    borderWidth: 1,
    borderColor: "#DCE8D7",
    color: "#2F6A3E",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: "#182019",
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -1.4,
  },
  heroBody: {
    color: "#5D6A60",
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 560,
  },
  heroActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  ctaPill: {
    borderWidth: 1,
    borderColor: "#DDE4D9",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  ctaPillPrimary: {
    backgroundColor: "#2F6A3E",
    borderColor: "#2F6A3E",
  },
  ctaText: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
  },
  ctaTextPrimary: {
    color: "#FFFFFF",
  },
  ctaLink: {
    borderWidth: 1,
    borderColor: "#DDE4D9",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
    overflow: "hidden",
  },
  ctaLinkPrimary: {
    backgroundColor: "#2F6A3E",
    borderColor: "#2F6A3E",
    color: "#FFFFFF",
  },
  statsRow: {
    gap: 12,
  },
  statsRowWide: {
    flexDirection: "row",
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "#E2E8DE",
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  statValue: {
    color: "#182019",
    fontSize: 23,
    fontWeight: "800",
  },
  statLabel: {
    color: "#5D6A60",
    fontSize: 13,
    lineHeight: 19,
  },
  previewColumn: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  previewColumnWide: {
    flex: 1,
  },
  phoneFrame: {
    position: "absolute",
    width: 286,
    height: 580,
    backgroundColor: "#101311",
    borderRadius: 36,
    padding: 12,
    ...shadow,
  },
  phonePrimary: {
    right: 4,
    top: 68,
    transform: [{ rotate: "3deg" }],
  },
  phoneSecondary: {
    left: 0,
    top: 0,
    transform: [{ rotate: "-5deg" }],
  },
  phoneNotch: {
    position: "absolute",
    top: 10,
    left: "50%",
    marginLeft: -54,
    width: 108,
    height: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "#101311",
    zIndex: 2,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#F7F8F5",
  },
  phoneHeaderSoft: {
    paddingTop: 28,
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: "#F0F6EC",
  },
  phoneHeaderStrong: {
    paddingTop: 28,
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: "#EDF3E7",
  },
  phoneBody: {
    padding: 16,
    gap: 12,
  },
  phoneChip: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F1E4",
    color: "#2F6A3E",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },
  phoneChipStrong: {
    backgroundColor: "#DDEBD9",
  },
  phoneHeading: {
    color: "#182019",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  phoneSubheading: {
    marginTop: 8,
    color: "#5D6A60",
    fontSize: 13,
    lineHeight: 19,
  },
  mockCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 20,
    padding: 14,
    gap: 12,
    ...cardShadow,
  },
  mockCardMuted: {
    backgroundColor: "#F5F7F1",
  },
  marketCard: {
    backgroundColor: "#FFF8E8",
    borderColor: "#F2D89D",
  },
  marketEyebrow: {
    color: "#876124",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  marketTitle: {
    color: "#182019",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  produceRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  produceThumb: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E7EFAF",
  },
  produceCopy: {
    flex: 1,
    gap: 2,
  },
  mockTitle: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  mockMeta: {
    color: "#5D6A60",
    fontSize: 12,
    lineHeight: 17,
  },
  inlineBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F3EA",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineBadgeText: {
    color: "#5D6A60",
    fontSize: 11,
    fontWeight: "600",
  },
  queueLabel: {
    color: "#2F6A3E",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  queueTitle: {
    color: "#182019",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  queueMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  queueMeta: {
    color: "#5D6A60",
    fontSize: 12,
  },
  queueMetaValue: {
    color: "#182019",
    fontSize: 12,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusChipText: {
    color: "#2F6A3E",
    fontSize: 11,
    fontWeight: "700",
  },
  sectionHeader: {
    gap: 10,
    paddingHorizontal: 6,
  },
  sectionEyebrow: {
    color: "#2F6A3E",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: "#182019",
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -0.8,
    maxWidth: 760,
  },
  sectionBody: {
    color: "#5D6A60",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
  },
  cardGrid: {
    gap: 16,
  },
  cardGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 260,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 28,
    padding: 22,
    gap: 12,
    ...shadow,
  },
  infoEyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F6EF",
    color: "#2F6A3E",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  infoTitle: {
    color: "#182019",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "800",
  },
  infoBody: {
    color: "#5D6A60",
    fontSize: 15,
    lineHeight: 23,
  },
  band: {
    backgroundColor: "#2D5D39",
    borderRadius: 32,
    padding: 24,
    ...shadow,
  },
  bandGrid: {
    gap: 18,
  },
  bandGridWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  bandCopy: {
    flex: 1.1,
    gap: 10,
  },
  bandEyebrow: {
    color: "#D8E9D4",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  bandTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  bandBody: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 620,
  },
  bandPanels: {
    flex: 0.9,
    gap: 12,
  },
  bandPanel: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  bandPanelTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bandPanelBody: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 21,
  },
  flowGrid: {
    gap: 16,
  },
  flowGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  flowCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 28,
    padding: 20,
    gap: 12,
    ...shadow,
  },
  flowCardAccent: {
    flex: 0.9,
    backgroundColor: "#F0F5EA",
    borderWidth: 1,
    borderColor: "#DCE6D6",
    borderRadius: 28,
    padding: 20,
    gap: 14,
    ...shadow,
  },
  flowTitle: {
    color: "#182019",
    fontSize: 22,
    fontWeight: "800",
  },
  flowTitleAccent: {
    color: "#182019",
    fontSize: 22,
    fontWeight: "800",
  },
  flowBodyAccent: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 22,
  },
  flowStep: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#FAFBF8",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flowIndex: {
    width: 34,
    color: "#2F6A3E",
    fontSize: 13,
    fontWeight: "800",
  },
  flowText: {
    flex: 1,
    color: "#182019",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  marketBoard: {
    gap: 10,
  },
  marketBoardRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DDE4D9",
    gap: 2,
  },
  marketBoardTitle: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
  },
  marketBoardMeta: {
    color: "#5D6A60",
    fontSize: 12,
    lineHeight: 18,
  },
  footerCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    marginBottom: 12,
    ...shadow,
  },
  authStatusCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    ...shadow,
  },
  bootstrapCard: {
    backgroundColor: "#F7FBF5",
    borderWidth: 1,
    borderColor: "#D6E3D0",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    ...shadow,
  },
  bootstrapEyebrow: {
    color: "#2F6A3E",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  bootstrapTitle: {
    color: "#182019",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    maxWidth: 760,
  },
  bootstrapBody: {
    color: "#5D6A60",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 780,
  },
  bootstrapChip: {
    backgroundColor: "#E7F1E4",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bootstrapChipText: {
    color: "#2F6A3E",
    fontSize: 12,
    fontWeight: "700",
  },
  footerEyebrow: {
    color: "#2F6A3E",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  footerTitle: {
    color: "#182019",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    maxWidth: 760,
  },
  footerBody: {
    color: "#5D6A60",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 760,
  },
  footerChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  footerChip: {
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footerChipText: {
    color: "#2F6A3E",
    fontSize: 12,
    fontWeight: "700",
  },
});
