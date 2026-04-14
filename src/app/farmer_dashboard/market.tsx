import { supabase } from "@/lib/supabase";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/auth-provider";

type MarketDay = {
  id: string;
  farmer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  status: "upcoming" | "active" | "past";
};

type Filter = "all" | "upcoming" | "past";
type PickerField = "date" | "start_time" | "end_time" | null;

const today = new Date();

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

function deriveStatus(dateStr: string): MarketDay["status"] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date < t) return "past";
  if (date.getTime() === t.getTime()) return "active";
  return "upcoming";
}

function dateToStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function timeToStr(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function strToDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function strToTime(timeStr: string): Date {
  const base = new Date();
  if (!timeStr) return base;
  const [h, m] = timeStr.split(":").map(Number);
  base.setHours(h, m, 0, 0);
  return base;
}

const EMPTY_FORM = {
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  notes: "",
};

const STATUS_LABEL: Record<MarketDay["status"], string> = {
  upcoming: "Upcoming",
  active: "Today",
  past: "Past",
};

const STATUS_COLOR: Record<MarketDay["status"], string> = {
  upcoming: "#2F6A3E",
  active: "#E07B39",
  past: "#9BA89E",
};

function MarketDayCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MarketDay;
  onEdit: (item: MarketDay) => void;
  onDelete: (id: string) => void;
}) {
  const isPast = item.status === "past";

  return (
    <View style={[styles.panel, isPast && { opacity: 0.6 }]}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1, marginRight: 10, gap: 2 }}>
          <Text style={styles.panelTitle}>{formatDate(item.date)}</Text>
          <Text style={styles.panelBody}>
            {formatTime(item.start_time)} – {formatTime(item.end_time)}
          </Text>
        </View>
        <View
          style={[
            styles.inlineButton,
            { backgroundColor: STATUS_COLOR[item.status] + "1A" },
          ]}
        >
          <Text
            style={[
              styles.inlineButtonText,
              { color: STATUS_COLOR[item.status] },
            ]}
          >
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.readonlyItem}>
        <Text style={styles.readonlyLabel}>Location</Text>
        <Text style={styles.readonlyValue}>{item.location}</Text>
      </View>

      {item.notes ? (
        <View style={styles.readonlyItem}>
          <Text style={styles.readonlyLabel}>Notes</Text>
          <Text style={styles.readonlyMeta}>{item.notes}</Text>
        </View>
      ) : null}

      {!isPast && (
        <View style={[styles.actionRow, { flexDirection: "row" }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1 }]}
            onPress={() => onEdit(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { flex: 1 }]}
            onPress={() => onDelete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: "#9C5B4D" }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function MarketDayModal({
  visible,
  initial,
  onSave,
  onClose,
  saving,
}: {
  visible: boolean;
  initial: typeof EMPTY_FORM | null;
  onSave: (form: typeof EMPTY_FORM) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [activePicker, setActivePicker] = useState<PickerField>(null);

  useEffect(() => {
    setForm(initial ?? EMPTY_FORM);
    setActivePicker(null);
  }, [initial, visible]);

  function set(key: keyof typeof EMPTY_FORM, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (!selected || event.type === "dismissed") {
      setActivePicker(null);
      return;
    }
    if (activePicker === "date") {
      set("date", dateToStr(selected));
    } else if (activePicker === "start_time") {
      set("start_time", timeToStr(selected));
    } else if (activePicker === "end_time") {
      set("end_time", timeToStr(selected));
    }
    setActivePicker(null);
  }

  function pickerValue(): Date {
    if (activePicker === "date")
      return form.date ? strToDate(form.date) : new Date();
    if (activePicker === "start_time")
      return form.start_time ? strToTime(form.start_time) : strToTime("08:00");
    if (activePicker === "end_time")
      return form.end_time ? strToTime(form.end_time) : strToTime("13:00");
    return new Date();
  }

  function validate(): boolean {
    if (!form.date) {
      Alert.alert("Missing date", "Please select a date for the market day.");
      return false;
    }
    if (!form.start_time) {
      Alert.alert("Missing start time", "Please select a start time.");
      return false;
    }
    if (!form.end_time) {
      Alert.alert("Missing end time", "Please select an end time.");
      return false;
    }
    if (!form.location.trim()) {
      Alert.alert("Missing location", "Please enter a market location.");
      return false;
    }
    return true;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <Text style={styles.panelTitle}>
            {initial?.date ? "Edit Market Day" : "New Market Day"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() =>
                  setActivePicker(activePicker === "date" ? null : "date")
                }
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: form.date ? "#182019" : "#B0BAB4",
                    fontSize: 15,
                  }}
                >
                  {form.date ? formatDate(form.date) : "Select a date"}
                </Text>
              </TouchableOpacity>
              {activePicker === "date" && (
                <DateTimePicker
                  value={pickerValue()}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handlePickerChange}
                  style={modalStyles.iosPicker}
                />
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start time</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: "center" }]}
                  onPress={() =>
                    setActivePicker(
                      activePicker === "start_time" ? null : "start_time",
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: form.start_time ? "#182019" : "#B0BAB4",
                      fontSize: 15,
                    }}
                  >
                    {form.start_time ? formatTime(form.start_time) : "08:00"}
                  </Text>
                </TouchableOpacity>
                {activePicker === "start_time" && (
                  <DateTimePicker
                    value={pickerValue()}
                    mode="time"
                    display="spinner"
                    is24Hour
                    onChange={handlePickerChange}
                    style={modalStyles.iosPicker}
                  />
                )}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>End time</Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: "center" }]}
                  onPress={() =>
                    setActivePicker(
                      activePicker === "end_time" ? null : "end_time",
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: form.end_time ? "#182019" : "#B0BAB4",
                      fontSize: 15,
                    }}
                  >
                    {form.end_time ? formatTime(form.end_time) : "13:00"}
                  </Text>
                </TouchableOpacity>
                {activePicker === "end_time" && (
                  <DateTimePicker
                    value={pickerValue()}
                    mode="time"
                    display="spinner"
                    is24Hour
                    onChange={handlePickerChange}
                    style={modalStyles.iosPicker}
                  />
                )}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Kristiansand Torv"
                placeholderTextColor="#B0BAB4"
                value={form.location}
                onChangeText={(v) => set("location", v)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any reminders or details…"
                placeholderTextColor="#B0BAB4"
                value={form.notes}
                onChangeText={(v) => set("notes", v)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={[styles.bottomRow, { flexDirection: "row" }]}>
            <TouchableOpacity
              style={[styles.secondaryButton, { flex: 1 }]}
              onPress={onClose}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { flex: 1 },
                saving && styles.buttonDisabled,
              ]}
              onPress={() => validate() && onSave(form)}
              activeOpacity={0.7}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function MarketDaysScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [marketDays, setMarketDays] = useState<MarketDay[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<typeof EMPTY_FORM | null>(
    null,
  );

  const fetchMarketDays = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("market_days")
      .select("*")
      .eq("farmer_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      setError("Failed to load market days.");
    } else {
      const withStatus = (data ?? []).map((d) => ({
        ...d,
        status: deriveStatus(d.date),
      }));
      setMarketDays(withStatus);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMarketDays();
  }, [fetchMarketDays]);

  const upcoming = marketDays.filter((d) => d.status !== "past");

  const sorted = [...marketDays]
    .filter((d) => {
      if (filter === "upcoming") return d.status !== "past";
      if (filter === "past") return d.status === "past";
      return true;
    })
    .sort((a, b) =>
      filter === "past"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date),
    );

  function openCreate() {
    setEditingId(null);
    setFormInitial(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(item: MarketDay) {
    setEditingId(item.id);
    setFormInitial({
      date: item.date,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      notes: item.notes ?? "",
    });
    setModalVisible(true);
  }

  async function handleSave(form: typeof EMPTY_FORM) {
    if (!user || !supabase) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("market_days")
        .update({
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
          location: form.location,
          notes: form.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        Alert.alert("Error", "Failed to update market day.");
      } else {
        await fetchMarketDays();
        setModalVisible(false);
      }
    } else {
      const { error } = await supabase.from("market_days").insert({
        farmer_id: user.id,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        location: form.location,
        notes: form.notes,
      });

      if (error) {
        Alert.alert("Error", "Failed to create market day.");
      } else {
        await fetchMarketDays();
        setModalVisible(false);
      }
    }

    setSaving(false);
  }

  function handleDelete(id: string) {
    Alert.alert(
      "Cancel market day",
      "Are you sure you want to remove this market day?",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (!supabase) return;
            const { error } = await supabase
              .from("market_days")
              .delete()
              .eq("id", id);
            if (error) {
              Alert.alert("Error", "Failed to remove market day.");
            } else {
              await fetchMarketDays();
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Farmer Dashboard</Text>
            <Text style={styles.heroTitle}>Market Days</Text>
            <Text style={styles.heroBody}>
              Schedule and manage your market appearances. Customers can see
              where to find you.
            </Text>
          </View>
          {upcoming.length > 0 && (
            <View style={styles.readonlyItem}>
              <Text style={styles.readonlyLabel}>Scheduled</Text>
              <Text style={styles.readonlyValue}>
                {upcoming.length}{" "}
                {upcoming.length === 1 ? "market day" : "market days"}
              </Text>
            </View>
          )}
          <View style={styles.dashboardButtonRow}>
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={openCreate}
              activeOpacity={0.8}
            >
              <Text style={styles.dashboardButtonText}>+ Add Market Day</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dashboardButtonRow}>
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["upcoming", "past", "all"] as Filter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.inlineButton,
                  filter === f && styles.optionCardActive,
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.inlineButtonText,
                    filter === f && styles.optionTitleActive,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color="#2F6A3E" />
            <Text style={styles.panelBody}>Loading market days…</Text>
          </View>
        ) : error ? (
          <View style={styles.panel}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.inlineButton}
              onPress={fetchMarketDays}
            >
              <Text style={styles.inlineButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : sorted.length === 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>
              {filter === "past" ? "No past market days" : "Nothing scheduled"}
            </Text>
            <Text style={styles.panelBody}>
              {filter === "past"
                ? "Your completed market days will appear here."
                : `Tap "+ Add Market Day" to schedule your first appearance.`}
            </Text>
          </View>
        ) : (
          sorted.map((item) => (
            <MarketDayCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      <MarketDayModal
        visible={modalVisible}
        initial={formInitial}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
        saving={saving}
      />
    </SafeAreaView>
  );
}

const shadow = {
  boxShadow: "0px 18px 40px rgba(26, 41, 30, 0.08)",
} as const;

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(24,32,25,0.35)",
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
  iosPicker: {
    width: "100%",
    backgroundColor: "#F7FBF5",
    borderRadius: 12,
    marginTop: 4,
  },
});

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  heroCard: {
    backgroundColor: "#21432D",
    borderRadius: 28,
    gap: 16,
    padding: 22,
    ...shadow,
  },
  avatarCircle: {
    alignItems: "center",
    backgroundColor: "#F3E6BB",
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: "#21432D",
    fontSize: 22,
    fontWeight: "800",
  },
  heroCopy: {
    gap: 6,
  },
  eyebrow: {
    color: "#B9D1BF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  heroBody: {
    color: "#D8E2DB",
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    ...shadow,
  },
  loadingPanel: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 18,
    ...shadow,
  },
  panelTitle: {
    color: "#182019",
    fontSize: 18,
    fontWeight: "800",
  },
  panelBody: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 21,
  },
  dashboardButtonRow: {
    marginTop: 15,
  },
  dashboardButton: {
    alignItems: "center",
    backgroundColor: "#2F6A3E",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHeader: {
    gap: 12,
  },
  sectionCopy: {
    gap: 4,
  },
  readonlyGrid: {
    gap: 12,
  },
  readonlyItem: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  readonlyLabel: {
    color: "#5D6A60",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  readonlyValue: {
    color: "#182019",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  readonlyMeta: {
    color: "#445148",
    fontSize: 14,
    lineHeight: 20,
  },
  textBlock: {
    gap: 6,
  },
  longValue: {
    color: "#213025",
    fontSize: 15,
    lineHeight: 22,
  },
  inlineButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  inlineButtonText: {
    color: "#214C2D",
    fontSize: 13,
    fontWeight: "700",
  },
  formGrid: {
    gap: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 18,
    borderWidth: 1,
    color: "#182019",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 110,
  },
  optionGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  optionCardActive: {
    backgroundColor: "#EEF5EB",
    borderColor: "#2F6A3E",
  },
  optionTitle: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  optionTitleActive: {
    color: "#214C2D",
  },
  optionBody: {
    color: "#5D6A60",
    fontSize: 13,
    lineHeight: 20,
  },
  optionBodyActive: {
    color: "#3A5441",
  },
  actionRow: {
    gap: 10,
    marginTop: 4,
  },
  bottomRow: {
    gap: 12,
    marginBottom: 8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2F6A3E",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#BFD2B9",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#2F6A3E",
    fontSize: 15,
    fontWeight: "700",
  },
  signOutButton: {
    backgroundColor: "#314A37",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: "#2E5B3C",
    fontSize: 14,
    lineHeight: 20,
  },
  footerText: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 22,
  },
  footerLink: {
    color: "#2F6A3E",
    fontWeight: "700",
  },
});
