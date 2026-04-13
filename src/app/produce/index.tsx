import { produceStyles } from "@/styles/produce-styles";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import produceData from "../../data/produceData.json";

type ProductDataItem = {
  id: string;
  name_nb: string;
  name_en: string | null;
};

type ProduceDataFile = {
  items: ProductDataItem[];
};

const typedProduceData = produceData as ProduceDataFile;

export default function ProduceListScreen() {
  const router = useRouter();

  return (
    <View style={produceStyles.container}>
      <View style={produceStyles.card}>
        <Text style={produceStyles.title}>Produce List</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={produceStyles.listContent}
        >
          {typedProduceData.items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/produce/${item.id}`)}
              style={produceStyles.produceItem}
            >
              <Text style={produceStyles.produceName}>{item.name_nb}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
