import { writeFile } from "node:fs/promises";
import path from "path";
import { produceList } from "../src/data/produceList";

type MatvaretabellenFood = {
  foodId?: string;
  foodName?: string;
  uri?: string;
  // Energy in kj
  energy?: {
    quantity?: number;
    unit?: string;
    sourceId?: string;
  };
  // Energy in kcal
  calories?: {
    quantity?: number;
    unit?: string;
    sourceId?: string;
  };
  // Other nutrients
  constituents?: {
    nutrientId?: string;
    quantity?: number;
    unit?: string;
    sourceId?: string;
  }[];
  [key: string]: unknown;
};

// Final nutrition table
type NutritionData = {
  per: "100g";
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

type MatvaretabellenFoodResponse = {
  foods: MatvaretabellenFood[];
};

// Final product table
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

const nutrientIdMap = {
  fat_g: "Fett",
  saturated_fat_g: "Mettet",
  carbohydrates_g: "Karbo",
  sugars_g: "Mono+Di",
  fiber_g: "Fiber",
  protein_g: "Protein",
  salt_g: "NaCl",
};

async function fetchFoods(
  language: "nb" | "en",
): Promise<MatvaretabellenFood[]> {
  const response = await fetch(
    `https://www.matvaretabellen.no/api/${language}/foods.json`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${language} foods: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as MatvaretabellenFoodResponse;

  if (!Array.isArray(data.foods)) {
    throw new Error(
      `Invalid API response for ${language}: expected 'foods' to be an array`,
    );
  }

  return data.foods;
}

function buildFoodIdLookup(
  foods: MatvaretabellenFood[],
): Map<string, MatvaretabellenFood> {
  const lookup = new Map<string, MatvaretabellenFood>();

  for (const food of foods) {
    if (typeof food.foodId !== "string") {
      continue;
    }

    if (!lookup.has(food.foodId)) {
      lookup.set(food.foodId, food);
    }
  }
  return lookup;
}

function buildConstituentLookup(
  constituents: MatvaretabellenFood["constituents"],
): Map<string, number> {
  const lookup = new Map<string, number>();

  if (!Array.isArray(constituents)) {
    return lookup;
  }

  for (const constituent of constituents) {
    if (
      typeof constituent.nutrientId !== "string" ||
      typeof constituent.quantity !== "number"
    ) {
      continue;
    }

    if (!lookup.has(constituent.nutrientId)) {
      lookup.set(constituent.nutrientId, constituent.quantity);
    }
  }
  return lookup;
}

function extractNutrition(food: MatvaretabellenFood | null): NutritionData {
  const constituentsLookup = buildConstituentLookup(food?.constituents);

  return {
    per: "100g",
    energy_kj:
      typeof food?.energy?.quantity === "number" ? food.energy.quantity : null,
    energy_kcal:
      typeof food?.calories?.quantity === "number"
        ? food.calories.quantity
        : null,
    fat_g: constituentsLookup.get(nutrientIdMap.fat_g) ?? null,
    saturated_fat_g:
      constituentsLookup.get(nutrientIdMap.saturated_fat_g) ?? null,
    carbohydrates_g:
      constituentsLookup.get(nutrientIdMap.carbohydrates_g) ?? null,
    sugars_g: constituentsLookup.get(nutrientIdMap.sugars_g) ?? null,
    fiber_g: constituentsLookup.get(nutrientIdMap.fiber_g) ?? null,
    protein_g: constituentsLookup.get(nutrientIdMap.protein_g) ?? null,
    salt_g: constituentsLookup.get(nutrientIdMap.salt_g) ?? null,
  };
}

async function generateProductData(): Promise<void> {
  const foods_nb = await fetchFoods("nb");
  const foods_en = await fetchFoods("en");

  const foodLookup_nb = buildFoodIdLookup(foods_nb);
  const foodLookup_en = buildFoodIdLookup(foods_en);

  const items: ProductDataItem[] = produceList.map((produce) => {
    const matchedFood_nb = foodLookup_nb.get(produce.foodId) ?? null;
    const matchedFood_en = foodLookup_en.get(produce.foodId) ?? null;

    return {
      id: produce.id,
      name_nb: produce.name_nb,
      name_en: matchedFood_en?.foodName ?? null,
      foodId: produce.foodId,
      category: produce.category,
      apiFoodName_nb: matchedFood_nb?.foodName ?? null,
      apiFoodName_en: matchedFood_en?.foodName ?? null,
      matvareUrl_nb: matchedFood_nb?.uri ?? null,
      matvareUrl_en: matchedFood_en?.uri ?? null,
      nutrition: extractNutrition(matchedFood_nb),
    };
  });

  const unmatched = items
    .filter(
      (item) =>
        item.apiFoodName_nb === null ||
        item.apiFoodName_en === null ||
        item.matvareUrl_nb === null ||
        item.matvareUrl_en === null,
    )
    .map((item) => item.name_nb);

  const output = {
    source: "Matvaretabellen",
    language: ["nb", "en"],
    totalRequested: produceList.length,
    totalMatched: items.length - unmatched.length,
    unmatched,
    items,
  };

  const outputPath = path.resolve(process.cwd(), "src/data/produceData.json");
  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");
}

generateProductData().catch((error) => {
  console.error("Error generating product data:", error);
  process.exit(1);
});
