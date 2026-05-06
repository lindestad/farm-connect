import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FarmHeroCard } from "../../components/FarmHeroCard";
import { fetchProduceByFarm, type FarmProduce } from "../../lib/farmProduce";
import {
  deleteFarmProfile,
  type FarmPickupDetails,
  type FarmMarketDay,
  type FarmProfile,
  fetchFarmPickupDetailsByFarmerId,
  fetchFarmProfileById,
  fetchUpcomingMarketDaysByFarmerId,
} from "../../lib/farmProfiles";
import { useAuth } from "../../providers/auth-provider";
import { farmStyles } from "../../styles/farm-styles";

// Helper function to format ISO timestamps into a more readable format
function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMarketDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMarketTime(value: string): string {
  return value.slice(0, 5);
}

function formatQuantity(value: number, unit: string): string {
  return `${Number(value).toLocaleString("en-GB")} ${unit}`;
}

// Panel component to display farm details and actions for the owner
function FarmDetailsPanel({
  farmProfile,
  isOwner,
  onEdit,
  onDelete,
  deleting,
}: {
  farmProfile: FarmProfile;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <View style={farmStyles.panel}>
      <View style={farmStyles.sectionHeader}>
        <Text style={farmStyles.panelTitle}>Farm details</Text>
        {isOwner ? (
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            style={farmStyles.inlineButton}
          >
            <Text style={farmStyles.inlineButtonText}>Edit farm profile</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={farmStyles.readonlyGrid}>
        <View style={farmStyles.readonlyItem}>
          <Text style={farmStyles.readonlyLabel}>Created</Text>
          <Text style={farmStyles.readonlyMeta}>
            {formatTimestamp(farmProfile.created_at)}
          </Text>
        </View>
        <View style={farmStyles.readonlyItem}>
          <Text style={farmStyles.readonlyLabel}>Last updated</Text>
          <Text style={farmStyles.readonlyMeta}>
            {formatTimestamp(farmProfile.updated_at)}
          </Text>
        </View>
      </View>

      {farmProfile.farm_bio ? (
        <View style={farmStyles.textBlock}>
          <Text style={farmStyles.readonlyLabel}>About</Text>
          <Text style={farmStyles.longValue}>{farmProfile.farm_bio}</Text>
        </View>
      ) : null}

      {isOwner ? (
        <Pressable
          accessibilityRole="button"
          disabled={deleting}
          onPress={onDelete}
          style={[
            farmStyles.deleteButton,
            deleting && farmStyles.buttonDisabled,
          ]}
        >
          {deleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={farmStyles.deleteButtonText}>Delete Farm</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function PickupAvailabilityPanel({
  details,
  loading,
  error,
}: {
  details: FarmPickupDetails;
  loading: boolean;
  error: string | null;
}) {
  const hasInventory = details.inventory.length > 0;
  const hasSlots = details.slots.length > 0;

  return (
    <View style={farmStyles.panel}>
      <View style={farmStyles.sectionHeader}>
        <Text style={farmStyles.panelTitle}>Pickup availability</Text>
        <Text style={farmStyles.readonlyMeta}>
          See produce available for reservation and upcoming pickup windows.
        </Text>
      </View>

      {loading ? (
        <View style={farmStyles.inlineStatus}>
          <ActivityIndicator color="#2F6A3E" />
          <Text style={farmStyles.readonlyMeta}>Loading pickup details...</Text>
        </View>
      ) : error ? (
        <Text style={farmStyles.errorText}>{error}</Text>
      ) : !hasInventory && !hasSlots ? (
        <Text style={farmStyles.emptyText}>
          No pickup produce or time slots are currently available.
        </Text>
      ) : (
        <View style={farmStyles.readonlyGrid}>
          <View style={farmStyles.textBlock}>
            <Text style={farmStyles.readonlyLabel}>Available produce</Text>
            {hasInventory ? (
              <View style={farmStyles.readonlyGrid}>
                {details.inventory.map((item) => (
                  <View key={item.id} style={farmStyles.readonlyItem}>
                    <Text style={farmStyles.rowName}>{item.produce_name}</Text>
                    <Text style={farmStyles.readonlyMeta}>
                      {formatQuantity(item.available_quantity, item.unit)}
                      {item.price_text ? ` - ${item.price_text}` : ""}
                    </Text>
                    {item.notes ? (
                      <Text style={farmStyles.readonlyMeta}>{item.notes}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={farmStyles.emptyText}>
                No produce is currently listed for pickup.
              </Text>
            )}
          </View>

          <View style={farmStyles.textBlock}>
            <Text style={farmStyles.readonlyLabel}>Pickup time slots</Text>
            {hasSlots ? (
              <View style={farmStyles.readonlyGrid}>
                {details.slots.map((slot) => (
                  <View key={slot.id} style={farmStyles.readonlyItem}>
                    <Text style={farmStyles.rowName}>
                      {formatMarketDate(slot.slot_date)}
                    </Text>
                    <Text style={farmStyles.readonlyMeta}>
                      {formatMarketTime(slot.start_time)}-
                      {formatMarketTime(slot.end_time)} - {slot.capacity}{" "}
                      {slot.capacity === 1 ? "reservation" : "reservations"}
                    </Text>
                    <Text style={farmStyles.longValue}>{slot.location}</Text>
                    {slot.notes ? (
                      <Text style={farmStyles.readonlyMeta}>{slot.notes}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={farmStyles.emptyText}>
                No upcoming pickup slots are currently scheduled.
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function UpcomingMarketDaysPanel({
  marketDays,
  loading,
  error,
}: {
  marketDays: FarmMarketDay[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <View style={farmStyles.panel}>
      <View style={farmStyles.sectionHeader}>
        <Text style={farmStyles.panelTitle}>Upcoming market days</Text>
        <Text style={farmStyles.readonlyMeta}>
          See where this farm will be selling in person.
        </Text>
      </View>

      {loading ? (
        <View style={farmStyles.inlineStatus}>
          <ActivityIndicator color="#2F6A3E" />
          <Text style={farmStyles.readonlyMeta}>Loading market days...</Text>
        </View>
      ) : error ? (
        <Text style={farmStyles.errorText}>{error}</Text>
      ) : marketDays.length === 0 ? (
        <Text style={farmStyles.emptyText}>
          No upcoming market days scheduled.
        </Text>
      ) : (
        <View style={farmStyles.readonlyGrid}>
          {marketDays.map((marketDay) => (
            <View key={marketDay.id} style={farmStyles.readonlyItem}>
              <Text style={farmStyles.rowName}>
                {formatMarketDate(marketDay.date)}
              </Text>
              <Text style={farmStyles.readonlyMeta}>
                {formatMarketTime(marketDay.start_time)}-
                {formatMarketTime(marketDay.end_time)}
              </Text>
              <Text style={farmStyles.longValue}>{marketDay.location}</Text>
              {marketDay.notes ? (
                <Text style={farmStyles.readonlyMeta}>{marketDay.notes}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function FarmProfileScreen() {
  const { farmId } = useLocalSearchParams<{ farmId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickupDetails, setPickupDetails] = useState<FarmPickupDetails>({
    inventory: [],
    slots: [],
  });
  const [pickupDetailsLoading, setPickupDetailsLoading] = useState(false);
  const [pickupDetailsError, setPickupDetailsError] = useState<string | null>(
    null,
  );
  const [marketDays, setMarketDays] = useState<FarmMarketDay[]>([]);
  const [marketDaysLoading, setMarketDaysLoading] = useState(false);
  const [marketDaysError, setMarketDaysError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [farmProduce, setFarmProduce] = useState<FarmProduce[]>([]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setFarmProfile(null);
    setPickupDetails({ inventory: [], slots: [] });
    setMarketDays([]);
    setErrorMessage(null);
    setPickupDetailsError(null);
    setMarketDaysError(null);

    fetchFarmProfileById(farmId)
      .then((profile) => {
        if (cancelled) return;
        setFarmProfile(profile);
        setLoading(false);

        if (!profile) return;

        setMarketDaysLoading(true);
        setPickupDetailsLoading(true);
        fetchUpcomingMarketDaysByFarmerId(profile.user_id)
          .then((days) => {
            if (!cancelled) setMarketDays(days);
          })
          .catch(() => {
            if (!cancelled) {
              setMarketDaysError("Unable to load upcoming market days.");
            }
          })
          .finally(() => {
            if (!cancelled) setMarketDaysLoading(false);
          });
        fetchFarmPickupDetailsByFarmerId(profile.user_id)
          .then((details) => {
            if (!cancelled) setPickupDetails(details);
          })
          .catch(() => {
            if (!cancelled) {
              setPickupDetailsError("Unable to load pickup availability.");
            }
          })
          .finally(() => {
            if (!cancelled) setPickupDetailsLoading(false);
          });
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [farmId]);

  useEffect(() => {
    if (!farmId) return;
    fetchProduceByFarm(farmId).then(setFarmProduce);
  }, [farmId]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Farm",
      "This will permanently remove your farm profile. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            try {
              setDeleting(true);
              await deleteFarmProfile(user.id);
              router.replace("/");
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Unable to delete farm profile.",
              );
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <ActivityIndicator color="#2F6A3E" />
      </SafeAreaView>
    );
  }

  if (errorMessage || !farmProfile) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <Text style={farmStyles.errorText}>
          {errorMessage ?? "Farm not found."}
        </Text>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === farmProfile.user_id;

  return (
    <SafeAreaView style={farmStyles.page}>
      <ScrollView
        contentContainerStyle={farmStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FarmHeroCard farmProfile={farmProfile} />
        <PickupAvailabilityPanel
          details={pickupDetails}
          error={pickupDetailsError}
          loading={pickupDetailsLoading}
        />
        <UpcomingMarketDaysPanel
          error={marketDaysError}
          loading={marketDaysLoading}
          marketDays={marketDays}
        />
        <FarmDetailsPanel
          deleting={deleting}
          farmProfile={farmProfile}
          isOwner={isOwner}
          onEdit={() => router.replace("/farm/edit")}
          onDelete={handleDelete}
        />
        {isOwner ? (
          <Pressable
            onPress={() => router.push("/farm/stock")}
            style={farmStyles.inlineButton}
          >
            <Text style={farmStyles.inlineButtonText}>Manage Stock</Text>
          </Pressable>
        ) : null}
        {farmProduce.length > 0 ? (
          <View style={farmStyles.panel}>
            <Text style={farmStyles.panelTitle}>Products</Text>
            {farmProduce.map((item) => (
              <Pressable
                key={item.id}
                style={farmStyles.inlineButton}
                onPress={() =>
                  router.push({
                    pathname: "/produce/[produce]",
                    params: {
                      produce: item.produce_id,
                      farmId: farmProfile.user_id,
                      price: item.price,
                      unit: item.unit,
                      stock: item.stock,
                    },
                  })
                }
              >
                <Text style={farmStyles.inlineButtonText}>
                  {item.name_nb} — {item.price} kr / {item.unit}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
