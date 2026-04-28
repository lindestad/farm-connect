import { useCart } from "@/providers/cart-provider";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1A3F24",
        tabBarInactiveTintColor: "#B0BDB0",
        tabBarStyle: {
          backgroundColor: "#C2DDB9",
          borderTopWidth: 0,
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: 20,
          elevation: 4,
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "#C2DDB9",
            borderTopWidth: 0,
            borderRadius: 24,
            marginHorizontal: 16,
            marginBottom: 20,
            elevation: 4,
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -1 },
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          },
        }}
      />
      <Tabs.Screen
        name="produce"
        options={{
          title: "Produce",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          title: "Checkout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
