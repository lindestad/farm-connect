import { supabase } from "@/lib/supabase";
import { produceList } from "@/data/produceList";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

type InventoryItem = {
  id: string;
  farmer_id: string;
  produce_id: string | null;
  produce_name: string;
  available_quantity: number;
  unit: string;
  price_text: string | null;
  notes: string | null;
  is_available: boolean;
};

type PickupSlot = {
  id: string;
  farmer_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  location: string;
  notes: string | null;
};

type Tab = "inventory" | "slots";
type PickerField = "slot_date" | "start_time" | "end_time" | null;

const EMPTY_INVENTORY_FORM = {
  produce_id: "",
  produce_name: "",
  available_quantity: "",
  unit: "kg",
  price_text: "",
  notes: "",
  is_available: true,
};

const EMPTY_SLOT_FORM = {
  slot_date: "",
  start_time: "",
  end_time: "",
  capacity: "8",
  location: "",
  notes: "",
};

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

function strToTime(timeStr: string, fallback = "08:00"): Date {
  const base = new Date();
  const [h, m] = (timeStr || fallback).split(":").map(Number);
  base.setHours(h, m, 0, 0);
  return base;
}

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
  return timeStr ? timeStr.slice(0, 5) : "";
}

function parseQuantity(value: string): number | null {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseCapacity(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function InventoryModal({
  visible,
  initial,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: typeof EMPTY_INVENTORY_FORM | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: typeof EMPTY_INVENTORY_FORM) => void;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_INVENTORY_FORM);

  useEffect(() => {
    setForm(initial ?? EMPTY_INVENTORY_FORM);
  }, [initial, visible]);

  function set(
    key: keyof typeof EMPTY_INVENTORY_FORM,
    value: string | boolean,
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectProduce(produce: (typeof produceList)[number]) {
    setForm((current) => ({
      ...current,
      produce_id: produce.id,
      produce_name: produce.name_nb,
    }));
  }

  function validate(): boolean {
    if (!form.produce_name.trim()) {
      Alert.alert("Missing produce", "Enter the product name.");
      return false;
    }
    if (parseQuantity(form.available_quantity) === null) {
      Alert.alert(
        "Invalid quantity",
        "Enter an available quantity of 0 or more.",
      );
      return false;
    }
    if (!form.unit.trim()) {
      Alert.alert(
        "Missing unit",
        "Enter a unit such as kg, bunches, or boxes.",
      );
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
            {initial?.produce_name ? "Edit Inventory" : "Add Inventory"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formGrid}
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Produce</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Potet"
                placeholderTextColor="#B0BAB4"
                value={form.produce_name}
                onChangeText={(value) => set("produce_name", value)}
                autoCapitalize="words"
              />
              <View style={styles.chipWrap}>
                {produceList.slice(0, 8).map((produce) => (
                  <TouchableOpacity
                    key={produce.id}
                    style={[
                      styles.inlineButton,
                      form.produce_id === produce.id && styles.optionCardActive,
                    ]}
                    onPress={() => selectProduce(produce)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.inlineButtonText,
                        form.produce_id === produce.id &&
                          styles.optionTitleActive,
                      ]}
                    >
                      {produce.name_nb}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#B0BAB4"
                  value={form.available_quantity}
                  onChangeText={(value) => set("available_quantity", value)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="kg"
                  placeholderTextColor="#B0BAB4"
                  value={form.unit}
                  onChangeText={(value) => set("unit", value)}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Price note</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 35 NOK/kg"
                placeholderTextColor="#B0BAB4"
                value={form.price_text}
                onChangeText={(value) => set("price_text", value)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.optionCard,
                form.is_available && styles.optionCardActive,
              ]}
              onPress={() => set("is_available", !form.is_available)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionTitle,
                  form.is_available && styles.optionTitleActive,
                ]}
              >
                {form.is_available
                  ? "Available for pickup"
                  : "Hidden from pickup"}
              </Text>
              <Text style={styles.optionBody}>
                Toggle this off when the product should stay in your list but
                not be offered to customers.
              </Text>
            </TouchableOpacity>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Packing notes, harvest details, or limits."
                placeholderTextColor="#B0BAB4"
                value={form.notes}
                onChangeText={(value) => set("notes", value)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.bottomRow}>
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

function SlotModal({
  visible,
  initial,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: typeof EMPTY_SLOT_FORM | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: typeof EMPTY_SLOT_FORM) => void;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_SLOT_FORM);
  const [activePicker, setActivePicker] = useState<PickerField>(null);

  useEffect(() => {
    setForm(initial ?? EMPTY_SLOT_FORM);
    setActivePicker(null);
  }, [initial, visible]);

  function set(key: keyof typeof EMPTY_SLOT_FORM, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function pickerValue(): Date {
    if (activePicker === "slot_date") return strToDate(form.slot_date);
    if (activePicker === "start_time")
      return strToTime(form.start_time, "16:00");
    if (activePicker === "end_time") return strToTime(form.end_time, "18:00");
    return new Date();
  }

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (!selected || event.type === "dismissed") {
      setActivePicker(null);
      return;
    }
    if (activePicker === "slot_date") set("slot_date", dateToStr(selected));
    if (activePicker === "start_time") set("start_time", timeToStr(selected));
    if (activePicker === "end_time") set("end_time", timeToStr(selected));
    setActivePicker(null);
  }

  function validate(): boolean {
    if (!form.slot_date) {
      Alert.alert("Missing date", "Select a pickup date.");
      return false;
    }
    if (!form.start_time || !form.end_time) {
      Alert.alert("Missing time", "Select a start and end time.");
      return false;
    }
    if (form.end_time <= form.start_time) {
      Alert.alert("Invalid time", "End time must be after start time.");
      return false;
    }
    if (parseCapacity(form.capacity) === null) {
      Alert.alert(
        "Invalid capacity",
        "Enter how many pickups this slot can handle.",
      );
      return false;
    }
    if (!form.location.trim()) {
      Alert.alert(
        "Missing location",
        "Enter where customers should collect orders.",
      );
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
            {initial?.slot_date ? "Edit Pickup Slot" : "Add Pickup Slot"}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formGrid}
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={[styles.input, styles.inputButton]}
                onPress={() =>
                  setActivePicker(
                    activePicker === "slot_date" ? null : "slot_date",
                  )
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.inputButtonText,
                    !form.slot_date && styles.placeholderText,
                  ]}
                >
                  {form.slot_date
                    ? formatDate(form.slot_date)
                    : "Select a date"}
                </Text>
              </TouchableOpacity>
              {activePicker === "slot_date" ? (
                <DateTimePicker
                  value={pickerValue()}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handlePickerChange}
                  style={modalStyles.iosPicker}
                />
              ) : null}
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start</Text>
                <TouchableOpacity
                  style={[styles.input, styles.inputButton]}
                  onPress={() =>
                    setActivePicker(
                      activePicker === "start_time" ? null : "start_time",
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.inputButtonText}>
                    {form.start_time ? formatTime(form.start_time) : "16:00"}
                  </Text>
                </TouchableOpacity>
                {activePicker === "start_time" ? (
                  <DateTimePicker
                    value={pickerValue()}
                    mode="time"
                    display="spinner"
                    is24Hour
                    onChange={handlePickerChange}
                    style={modalStyles.iosPicker}
                  />
                ) : null}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>End</Text>
                <TouchableOpacity
                  style={[styles.input, styles.inputButton]}
                  onPress={() =>
                    setActivePicker(
                      activePicker === "end_time" ? null : "end_time",
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.inputButtonText}>
                    {form.end_time ? formatTime(form.end_time) : "18:00"}
                  </Text>
                </TouchableOpacity>
                {activePicker === "end_time" ? (
                  <DateTimePicker
                    value={pickerValue()}
                    mode="time"
                    display="spinner"
                    is24Hour
                    onChange={handlePickerChange}
                    style={modalStyles.iosPicker}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Capacity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="8"
                  placeholderTextColor="#B0BAB4"
                  value={form.capacity}
                  onChangeText={(value) => set("capacity", value)}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 2 }]}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Farm gate"
                  placeholderTextColor="#B0BAB4"
                  value={form.location}
                  onChangeText={(value) => set("location", value)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Pickup instructions or packing deadline."
                placeholderTextColor="#B0BAB4"
                value={form.notes}
                onChangeText={(value) => set("notes", value)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.bottomRow}>
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

export default function PickupInventoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(
    null,
  );
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [inventoryInitial, setInventoryInitial] = useState<
    typeof EMPTY_INVENTORY_FORM | null
  >(null);
  const [slotInitial, setSlotInitial] = useState<typeof EMPTY_SLOT_FORM | null>(
    null,
  );

  const fetchPickupData = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);
    setError(null);

    const [inventoryResult, slotsResult] = await Promise.all([
      supabase
        .from("pickup_inventory")
        .select("*")
        .eq("farmer_id", user.id)
        .order("produce_name", { ascending: true }),
      supabase
        .from("pickup_time_slots")
        .select("*")
        .eq("farmer_id", user.id)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true }),
    ]);

    if (inventoryResult.error || slotsResult.error) {
      setError("Failed to load pickup data.");
    } else {
      setInventory((inventoryResult.data ?? []) as InventoryItem[]);
      setSlots((slotsResult.data ?? []) as PickupSlot[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPickupData();
  }, [fetchPickupData]);

  const upcomingSlots = useMemo(() => {
    const today = dateToStr(new Date());
    return slots.filter((slot) => slot.slot_date >= today);
  }, [slots]);

  const activeInventory = useMemo(
    () =>
      inventory.filter(
        (item) => item.is_available && Number(item.available_quantity) > 0,
      ),
    [inventory],
  );

  function openCreateInventory() {
    setEditingInventoryId(null);
    setInventoryInitial(EMPTY_INVENTORY_FORM);
    setInventoryModalVisible(true);
  }

  function openEditInventory(item: InventoryItem) {
    setEditingInventoryId(item.id);
    setInventoryInitial({
      produce_id: item.produce_id ?? "",
      produce_name: item.produce_name,
      available_quantity: String(item.available_quantity),
      unit: item.unit,
      price_text: item.price_text ?? "",
      notes: item.notes ?? "",
      is_available: item.is_available,
    });
    setInventoryModalVisible(true);
  }

  function openCreateSlot() {
    setEditingSlotId(null);
    setSlotInitial(EMPTY_SLOT_FORM);
    setSlotModalVisible(true);
  }

  function openEditSlot(slot: PickupSlot) {
    setEditingSlotId(slot.id);
    setSlotInitial({
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      capacity: String(slot.capacity),
      location: slot.location,
      notes: slot.notes ?? "",
    });
    setSlotModalVisible(true);
  }

  async function handleSaveInventory(form: typeof EMPTY_INVENTORY_FORM) {
    if (!user || !supabase) return;
    const quantity = parseQuantity(form.available_quantity);
    if (quantity === null) return;
    setSaving(true);

    const payload = {
      produce_id: form.produce_id || null,
      produce_name: form.produce_name.trim(),
      available_quantity: quantity,
      unit: form.unit.trim(),
      price_text: form.price_text.trim() || null,
      notes: form.notes.trim() || null,
      is_available: form.is_available,
      updated_at: new Date().toISOString(),
    };

    const result = editingInventoryId
      ? await supabase
          .from("pickup_inventory")
          .update(payload)
          .eq("id", editingInventoryId)
      : await supabase.from("pickup_inventory").insert({
          ...payload,
          farmer_id: user.id,
        });

    if (result.error) {
      Alert.alert("Error", "Failed to save inventory.");
    } else {
      await fetchPickupData();
      setInventoryModalVisible(false);
    }
    setSaving(false);
  }

  async function handleSaveSlot(form: typeof EMPTY_SLOT_FORM) {
    if (!user || !supabase) return;
    const capacity = parseCapacity(form.capacity);
    if (capacity === null) return;
    setSaving(true);

    const payload = {
      slot_date: form.slot_date,
      start_time: form.start_time,
      end_time: form.end_time,
      capacity,
      location: form.location.trim(),
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const result = editingSlotId
      ? await supabase
          .from("pickup_time_slots")
          .update(payload)
          .eq("id", editingSlotId)
      : await supabase.from("pickup_time_slots").insert({
          ...payload,
          farmer_id: user.id,
        });

    if (result.error) {
      Alert.alert("Error", "Failed to save pickup slot.");
    } else {
      await fetchPickupData();
      setSlotModalVisible(false);
    }
    setSaving(false);
  }

  function handleDeleteInventory(id: string) {
    Alert.alert(
      "Remove inventory",
      "Remove this product from pickup inventory?",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (!supabase) return;
            const { error } = await supabase
              .from("pickup_inventory")
              .delete()
              .eq("id", id);
            if (error) {
              Alert.alert("Error", "Failed to remove inventory.");
            } else {
              await fetchPickupData();
            }
          },
        },
      ],
    );
  }

  function handleDeleteSlot(id: string) {
    Alert.alert("Remove pickup slot", "Remove this pickup time slot?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (!supabase) return;
          const { error } = await supabase
            .from("pickup_time_slots")
            .delete()
            .eq("id", id);
          if (error) {
            Alert.alert("Error", "Failed to remove pickup slot.");
          } else {
            await fetchPickupData();
          }
        },
      },
    ]);
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
            <Text style={styles.heroTitle}>Pickup Inventory</Text>
            <Text style={styles.heroBody}>
              Keep pickup products and collection windows ready for customer
              reservations.
            </Text>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.readonlyItem}>
              <Text style={styles.readonlyLabel}>Available</Text>
              <Text style={styles.readonlyValue}>
                {activeInventory.length} products
              </Text>
            </View>
            <View style={styles.readonlyItem}>
              <Text style={styles.readonlyLabel}>Upcoming</Text>
              <Text style={styles.readonlyValue}>
                {upcomingSlots.length} slots
              </Text>
            </View>
          </View>

          <View style={styles.dashboardButtonRow}>
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={
                activeTab === "inventory" ? openCreateInventory : openCreateSlot
              }
              activeOpacity={0.8}
            >
              <Text style={styles.dashboardButtonText}>
                {activeTab === "inventory" ? "+ Add Inventory" : "+ Add Slot"}
              </Text>
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
          <View style={styles.row}>
            {(["inventory", "slots"] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.optionCardActive,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.inlineButtonText,
                    activeTab === tab && styles.optionTitleActive,
                  ]}
                >
                  {tab === "inventory" ? "Inventory" : "Time Slots"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color="#2F6A3E" />
            <Text style={styles.panelBody}>Loading pickup data...</Text>
          </View>
        ) : error ? (
          <View style={styles.panel}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.inlineButton}
              onPress={fetchPickupData}
              activeOpacity={0.7}
            >
              <Text style={styles.inlineButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === "inventory" ? (
          inventory.length === 0 ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>No pickup inventory</Text>
              <Text style={styles.panelBody}>
                Add products, quantities, and price notes for customer pickup.
              </Text>
            </View>
          ) : (
            inventory.map((item) => (
              <View
                key={item.id}
                style={[styles.panel, !item.is_available && { opacity: 0.62 }]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.panelTitle}>{item.produce_name}</Text>
                    <Text style={styles.panelBody}>
                      {item.available_quantity} {item.unit}
                      {item.price_text ? ` - ${item.price_text}` : ""}
                    </Text>
                  </View>
                  <View style={styles.inlineButton}>
                    <Text style={styles.inlineButtonText}>
                      {item.is_available ? "Visible" : "Hidden"}
                    </Text>
                  </View>
                </View>

                {item.notes ? (
                  <View style={styles.readonlyItem}>
                    <Text style={styles.readonlyLabel}>Notes</Text>
                    <Text style={styles.readonlyMeta}>{item.notes}</Text>
                  </View>
                ) : null}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1 }]}
                    onPress={() => openEditInventory(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.primaryButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { flex: 1 }]}
                    onPress={() => handleDeleteInventory(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.secondaryButtonText, styles.dangerText]}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : slots.length === 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>No pickup slots</Text>
            <Text style={styles.panelBody}>
              Add pickup windows so customers know when orders can be collected.
            </Text>
          </View>
        ) : (
          slots.map((slot) => (
            <View key={slot.id} style={styles.panel}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.panelTitle}>
                    {formatDate(slot.slot_date)}
                  </Text>
                  <Text style={styles.panelBody}>
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </Text>
                </View>
                <View style={styles.inlineButton}>
                  <Text style={styles.inlineButtonText}>
                    {slot.capacity} pickups
                  </Text>
                </View>
              </View>

              <View style={styles.readonlyItem}>
                <Text style={styles.readonlyLabel}>Location</Text>
                <Text style={styles.readonlyValue}>{slot.location}</Text>
              </View>

              {slot.notes ? (
                <View style={styles.readonlyItem}>
                  <Text style={styles.readonlyLabel}>Notes</Text>
                  <Text style={styles.readonlyMeta}>{slot.notes}</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }]}
                  onPress={() => openEditSlot(slot)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1 }]}
                  onPress={() => handleDeleteSlot(slot.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryButtonText, styles.dangerText]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <InventoryModal
        visible={inventoryModalVisible}
        initial={inventoryInitial}
        saving={saving}
        onClose={() => setInventoryModalVisible(false)}
        onSave={handleSaveInventory}
      />
      <SlotModal
        visible={slotModalVisible}
        initial={slotInitial}
        saving={saving}
        onClose={() => setSlotModalVisible(false)}
        onSave={handleSaveSlot}
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
    gap: 16,
    maxHeight: "90%",
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#D8DDD8",
    borderRadius: 2,
    height: 4,
    marginBottom: 4,
    width: 40,
  },
  iosPicker: {
    backgroundColor: "#F7FBF5",
    borderRadius: 12,
    marginTop: 4,
    width: "100%",
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
  },
  heroBody: {
    color: "#D8E2DB",
    fontSize: 15,
    lineHeight: 22,
  },
  statGrid: {
    flexDirection: "row",
    gap: 10,
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
    marginTop: 8,
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
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  readonlyItem: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  tabButton: {
    alignItems: "center",
    backgroundColor: "#EEF5EB",
    borderColor: "#EEF5EB",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
  inputButton: {
    justifyContent: "center",
  },
  inputButtonText: {
    color: "#182019",
    fontSize: 15,
  },
  placeholderText: {
    color: "#B0BAB4",
  },
  textArea: {
    minHeight: 110,
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row",
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
  dangerText: {
    color: "#9C5B4D",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    lineHeight: 20,
  },
});
