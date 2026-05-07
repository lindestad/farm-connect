import { useCart } from "@/providers/cart-provider";
import { produceStyles } from "@/styles/produce-styles";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import produceData from "../../data/produceData.json";

// Complete product data structure based on the output from generateProductData.ts
type ProductDataItem = {
  id: string;
  name_nb: string;
  name_en: string | null;
  foodId: string;
  category: string;
  price: number;
  unit: string;
  apiFoodName_nb: string | null;
  apiFoodName_en: string | null;
  matvareUrl_nb: string | null;
  matvareUrl_en: string | null;
  nutrition: NutritionData;
};

// Nutrition data structure based on the output from generateProductData.ts
type NutritionData = {
  per: string;
  energy_kj: number | null;
  energy_kcal: number | null;
  fat_g: number | null;
  saturated_fat_g: number | null;
  carbohydrates_g: number | null;
  sugars_g: number | null;
  fiber_g: number | null;
  protein_g: number | null;
  salt_g: number | null;
};

// Define the nutrition fields to display in the UI
const nutritionFields: {
  label: string;
  key: Exclude<keyof NutritionData, "per">;
  unit: string;
}[] = [
  { label: "Energy", key: "energy_kj", unit: "kJ" },
  { label: "Calories", key: "energy_kcal", unit: "kcal" },
  { label: "Fat", key: "fat_g", unit: "g" },
  { label: "Saturated Fat", key: "saturated_fat_g", unit: "g" },
  { label: "Carbohydrates", key: "carbohydrates_g", unit: "g" },
  { label: "Sugars", key: "sugars_g", unit: "g" },
  { label: "Fiber", key: "fiber_g", unit: "g" },
  { label: "Protein", key: "protein_g", unit: "g" },
  { label: "Salt", key: "salt_g", unit: "g" },
] as const;

type ProduceDataFile = { items: ProductDataItem[] };

const typedProduceData = produceData as ProduceDataFile;

function formatValue(value: number | null, unit: string): string {
  if (value === null) {
    return "N/A";
  }
  return `${value} ${unit}`;
}

function NutritionRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={produceStyles.nutritionRow}>
      <Text style={produceStyles.nutritionLabel}>{label}</Text>
      <Text style={produceStyles.nutritionValue}>{value}</Text>
    </View>
  );
}

export default function ProduceScreen() {
  const { produce, farmId, price, unit, stock } = useLocalSearchParams<{
    produce: string;
    farmId: string;
    price: string;
    unit: string;
    stock: string;
  }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const item = typedProduceData.items.find((i) => i.id === produce);
  const farmPrice = price ? parseFloat(price) : (item?.price ?? 0);
  const farmUnit = unit ?? item?.unit ?? "";
  const availableStock = stock ? parseFloat(stock) : null;

  if (!item) {
    return (
      <View style={produceStyles.container}>
        <View style={produceStyles.card}>
          <Text style={produceStyles.errorText}>Product not found</Text>
        </View>
      </View>
    );
  }

  function handleAddToCart() {
    addItem({
      produce_id: item!.id,
      produce_name: item!.name_nb,
      farm_id: farmId,
      qty,
      unit: farmUnit,
      price_per_unit: farmPrice,
    });
    router.push("/(tabs)/checkout");
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={backButtonStyle.button}
      >
        <Text style={backButtonStyle.text}>← Back</Text>
      </Pressable>
      <ScrollView
        style={produceStyles.scrollView}
        contentContainerStyle={produceStyles.scrollContent}
      >
        <View style={produceStyles.card}>
          <Text style={produceStyles.title}>{item.name_nb}</Text>

          {item.name_en ? (
            <Text style={produceStyles.detail}>{item.name_en}</Text>
          ) : null}

          <View style={produceStyles.metaBox}>
            <Text style={produceStyles.metaText}>
              Category: {item.category}
            </Text>
            <Text style={produceStyles.metaText}>
              Per: {item.nutrition.per}
            </Text>
            <Text style={produceStyles.metaText}>Food ID: {item.foodId}</Text>
          </View>

          {item.matvareUrl_nb ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(item.matvareUrl_nb!)}
              style={produceStyles.linkButton}
            >
              <Text style={produceStyles.linkText}>
                Source (Norwegian): Matvaretabellen
              </Text>
            </Pressable>
          ) : null}

          {item.matvareUrl_en ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(item.matvareUrl_en!)}
              style={produceStyles.linkButton}
            >
              <Text style={produceStyles.linkText}>
                Source (English): Matvaretabellen
              </Text>
            </Pressable>
          ) : null}

          <View style={produceStyles.nutritionTable}>
            <Text style={produceStyles.tableTitle}>Nutrition</Text>
            {nutritionFields.map((field) => (
              <NutritionRow
                key={field.key}
                label={field.label}
                value={formatValue(item.nutrition[field.key], field.unit)}
              />
            ))}
          </View>

          {farmId ? (
            <View style={produceStyles.cartSection}>
              {availableStock !== null ? (
                <Text style={produceStyles.detail}>
                  {availableStock} {farmUnit} available
                </Text>
              ) : null}
              <View style={produceStyles.qtyRow}>
                <Pressable
                  accessibilityRole="button"
                  style={produceStyles.qtyButton}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Text style={produceStyles.qtyButtonText}>−</Text>
                </Pressable>
                <Text style={produceStyles.qtyValue}>
                  {qty} {farmUnit}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  style={produceStyles.qtyButton}
                  onPress={() =>
                    setQty((q) =>
                      availableStock !== null
                        ? Math.min(availableStock, q + 1)
                        : q + 1,
                    )
                  }
                >
                  <Text style={produceStyles.qtyButtonText}>+</Text>
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                style={[
                  produceStyles.addToCartButton,
                  availableStock === 0 && { opacity: 0.4 },
                ]}
                onPress={handleAddToCart}
                disabled={availableStock === 0}
              >
                <Text style={produceStyles.addToCartText}>
                  {availableStock === 0
                    ? "Out of stock"
                    : `Add to Cart · ${farmPrice * qty} kr`}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              style={produceStyles.addToCartButton}
              onPress={() => router.push("/produce")}
            >
              <Text style={produceStyles.addToCartText}>
                Browse farms to purchase
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const backButtonStyle = {
  button: {
    alignSelf: "flex-start" as const,
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
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
