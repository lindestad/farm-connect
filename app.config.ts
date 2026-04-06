import { ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []).filter(
      (plugin) => !(Array.isArray(plugin) && plugin[0] === "react-native-maps"),
    ),
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
});
