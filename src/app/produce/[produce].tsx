import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import produceData from "../../data/produceData.json";

// Complete product data structure based on the output from generateProductData.ts
type ProductDataItem = {
  id: string;
  name_nb: string;
  name_en: string | null;
  foodId: string;
  category: string;
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
  key: keyof NutritionData;
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
    <View style={styles.nutritionRow}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{value}</Text>
    </View>
  );
}

export default function ProduceScreen() {
  const { produce } = useLocalSearchParams<{ produce: string }>();
  const item = typedProduceData.items.find((item) => item.id === produce);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{item.name_nb}</Text>

      {item.name_en ? (
        <Text style={styles.subtitle}>{item.name_en}</Text>
      ) : null}

      <View style={styles.metaBox}>
        <Text style={styles.metaText}>Category: {item.category}</Text>
        <Text style={styles.metaText}>Per: {item.nutrition.per}</Text>
        <Text style={styles.metaText}>Food ID: {item.foodId}</Text>
      </View>

      {item.matvareUrl_nb ? (
        <Pressable
          onPress={() => Linking.openURL(item.matvareUrl_nb!)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            Source (Norwegian): Matvaretabellen
          </Text>
        </Pressable>
      ) : null}

      {item.matvareUrl_en ? (
        <Pressable
          onPress={() => Linking.openURL(item.matvareUrl_en!)}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Source (English): Matvaretabellen</Text>
        </Pressable>
      ) : null}

      <View style={styles.nutritionTable}>
        <Text style={styles.tableTitle}>Nutrition</Text>
        {nutritionFields.map((field) => (
          <NutritionRow
            key={field.key}
            label={field.label}
            value={formatValue(item.nutrition[field.key] as number, field.unit)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  metaBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    gap: 4,
    backgroundColor: "#f8f8f8",
  },
  metaText: {
    fontSize: 14,
  },
  linkButton: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  nutritionTable: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "700",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  nutritionLabel: {
    fontSize: 15,
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});
