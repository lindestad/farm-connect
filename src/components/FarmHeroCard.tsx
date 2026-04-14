import { Text, View } from "react-native";

import { type FarmProfile } from "../lib/farmProfiles";
import { farmStyles } from "../styles/farm-styles";

function farmInitials(name: string): string {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "FC"
  );
}

export function FarmHeroCard({ farmProfile }: { farmProfile: FarmProfile }) {
  return (
    <View style={farmStyles.heroCard}>
      <View style={farmStyles.avatarCircle}>
        <Text style={farmStyles.avatarText}>
          {farmInitials(farmProfile.farm_name)}
        </Text>
      </View>
      <View style={farmStyles.heroCopy}>
        <Text style={farmStyles.eyebrow}>Farm profile</Text>
        <Text style={farmStyles.heroTitle}>{farmProfile.farm_name}</Text>
        {farmProfile.farm_location ? (
          <Text style={farmStyles.heroBody}>{farmProfile.farm_location}</Text>
        ) : null}
      </View>
    </View>
  );
}
