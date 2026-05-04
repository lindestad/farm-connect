import {
  deleteFarmProduce,
  fetchProduceByFarm,
  upsertFarmProduce,
  type FarmProduce,
} from "@/lib/farmProduce";
import { fetchFarmProfileByUserId } from "@/lib/farmProfiles";
import { useAuth } from "@/providers/auth-provider";
import { farmStyles } from "@/styles/farm-styles";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import produceData from "../../data/produceData.json";

type ProduceDataItem = {
  id: string;
  name_nb: string;
  unit: string;
  price: number;
};

type ProduceDataFile = { items: ProduceDataItem[] };

const typedProduceData = produceData as ProduceDataFile;

type EditModal = {
  produceId: string;
  name: string;
  price: string;
  stock: string;
  unit: string;
};

export default function FarmStockScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [farmId, setFarmId] = useState<string | null>(null);
  const [stockItems, setStockItems] = useState<FarmProduce[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<EditModal | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchFarmProfileByUserId(user.id)
      .then((profile) => {
        if (!profile) return;
        setFarmId(profile.id);
        return fetchProduceByFarm(profile.id);
      })
      .then((items) => setStockItems(items ?? []))
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function refreshStock() {
    if (!farmId) return;
    const items = await fetchProduceByFarm(farmId);
    setStockItems(items);
  }

  function openAdd(item: ProduceDataItem) {
    setModal({
      produceId: item.id,
      name: item.name_nb,
      price: String(item.price),
      stock: "0",
      unit: item.unit,
    });
  }

  function openEdit(item: FarmProduce) {
    setModal({
      produceId: item.produce_id,
      name: item.name_nb ?? item.produce_id,
      price: String(item.price),
      stock: String(item.stock),
      unit: item.unit,
    });
  }

  async function handleSave() {
    if (!modal || !farmId) return;
    const price = parseFloat(modal.price);
    const stock = parseFloat(modal.stock);
    if (isNaN(price) || price < 0) {
      Alert.alert("Invalid price", "Enter a valid price.");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      Alert.alert("Invalid stock", "Enter a valid stock amount.");
      return;
    }
    setSaving(true);
    try {
      await upsertFarmProduce(
        farmId,
        modal.produceId,
        price,
        stock,
        modal.unit,
      );
      await refreshStock();
      setModal(null);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(item: FarmProduce) {
    Alert.alert(
      "Remove product",
      `Remove ${item.name_nb ?? item.produce_id} from your stock?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (!farmId) return;
            try {
              await deleteFarmProduce(farmId, item.produce_id);
              await refreshStock();
            } catch (e: unknown) {
              Alert.alert(
                "Error",
                e instanceof Error ? e.message : "Could not delete.",
              );
            }
          },
        },
      ],
    );
  }

  const stockIds = new Set(stockItems.map((i) => i.produce_id));

  const availableToAdd = typedProduceData.items.filter(
    (i) =>
      !stockIds.has(i.id) &&
      i.name_nb.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <ActivityIndicator color="#2F6A3E" />
      </SafeAreaView>
    );
  }

  if (!farmId) {
    return (
      <SafeAreaView style={farmStyles.page}>
        <Text style={farmStyles.errorText}>
          You don&apos;t have a farm profile yet.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={farmStyles.page}>
      <ScrollView
        contentContainerStyle={farmStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={farmStyles.panel}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={farmStyles.panelTitle}>My Stock</Text>
            <Pressable
              onPress={() => router.back()}
              style={farmStyles.inlineButton}
            >
              <Text style={farmStyles.inlineButtonText}>← Back</Text>
            </Pressable>
          </View>

          {stockItems.length === 0 ? (
            <Text style={farmStyles.emptyText}>No products in stock yet.</Text>
          ) : (
            stockItems.map((item) => (
              <View key={item.id} style={farmStyles.readonlyItem}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={farmStyles.rowName}>
                      {item.name_nb ?? item.produce_id}
                    </Text>
                    <Text style={farmStyles.readonlyMeta}>
                      {item.price} kr / {item.unit} · Stock: {item.stock}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => openEdit(item)}
                      style={farmStyles.inlineButton}
                    >
                      <Text style={farmStyles.inlineButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(item)}
                      style={[
                        farmStyles.inlineButton,
                        { backgroundColor: "#F9EDEB" },
                      ]}
                    >
                      <Text
                        style={[
                          farmStyles.inlineButtonText,
                          { color: "#7A2A20" },
                        ]}
                      >
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={farmStyles.panel}>
          <Text style={farmStyles.panelTitle}>Add Products</Text>
          <TextInput
            style={farmStyles.searchInput}
            placeholder="Search produce..."
            placeholderTextColor="#9AA89D"
            value={search}
            onChangeText={setSearch}
          />
          {availableToAdd.length === 0 ? (
            <Text style={farmStyles.emptyText}>No products to add.</Text>
          ) : (
            availableToAdd.map((item) => (
              <View key={item.id} style={farmStyles.readonlyItem}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ gap: 2 }}>
                    <Text style={farmStyles.rowName}>{item.name_nb}</Text>
                    <Text style={farmStyles.readonlyMeta}>
                      {item.price} kr / {item.unit}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => openAdd(item)}
                    style={farmStyles.inlineButton}
                  >
                    <Text style={farmStyles.inlineButtonText}>+ Add</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={modal !== null} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View style={farmStyles.card}>
            <Text style={farmStyles.panelTitle}>
              {stockIds.has(modal?.produceId ?? "") ? "Edit" : "Add"}{" "}
              {modal?.name}
            </Text>

            <View style={farmStyles.fieldGroup}>
              <Text style={farmStyles.label}>Price (kr)</Text>
              <TextInput
                style={farmStyles.input}
                keyboardType="decimal-pad"
                value={modal?.price ?? ""}
                onChangeText={(v) =>
                  setModal((m) => (m ? { ...m, price: v } : m))
                }
              />
            </View>

            <View style={farmStyles.fieldGroup}>
              <Text style={farmStyles.label}>Stock ({modal?.unit})</Text>
              <TextInput
                style={farmStyles.input}
                keyboardType="decimal-pad"
                value={modal?.stock ?? ""}
                onChangeText={(v) =>
                  setModal((m) => (m ? { ...m, stock: v } : m))
                }
              />
            </View>

            <Pressable
              style={[
                farmStyles.primaryButton,
                saving && farmStyles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={farmStyles.primaryButtonText}>Save</Text>
              )}
            </Pressable>

            <Pressable
              style={[farmStyles.inlineButton, { alignSelf: "center" }]}
              onPress={() => setModal(null)}
            >
              <Text style={farmStyles.inlineButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
