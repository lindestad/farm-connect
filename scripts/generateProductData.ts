import { writeFile } from "node:fs/promises";
import path from "path";
import { produceList } from "../src/data/produceList";

type MatvaretabellenFood = {
    foodId?: string;
    foodName?: string;
    [key: string]: unknown;
};

type MatvaretabellenFoodResponse = {
    foods: MatvaretabellenFood[];
};

type ProductDataItem = {
    id: string;
    name_nb: string;
    name_en: string | null;
    foodId: string;
    category: string;
    apiFoodName_nb: string | null;
    apiFoodName_en: string | null;
};

async function fetchFoods(language: "nb" | "en"): Promise<MatvaretabellenFood[]> {
    const response = await fetch(`https://www.matvaretabellen.no/api/${language}/foods.json`);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${language} foods: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as MatvaretabellenFoodResponse;

    if (!Array.isArray(data.foods)) {
        throw new Error(`Invalid API response for ${language}: expected 'foods' to be an array`);
    }

    return data.foods;
}

function buildFoodIdLookup(foods: MatvaretabellenFood[]): Map<string, MatvaretabellenFood> {
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
        };
    });

    const unmatched = items
        .filter((item) => item.apiFoodName_nb === null || item.apiFoodName_en === null)
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
    
    console.log(`Saved produce data to ${outputPath}`);
    console.log(`Matched ${output.totalMatched} out of ${output.totalRequested} produce items.`);

    if (unmatched.length > 0) {
        console.log("Unmatched products:");
        for (const name of unmatched) {
            console.log(`- ${name}`);
        }
    }
}

generateProductData().catch((error) => {
    console.error("Error generating product data:", error);
    process.exit(1);
});