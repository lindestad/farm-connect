import { useOrderPayment } from "@/hooks/useOrderPayment";
import { orderStyles } from "@/styles/order-styles";
import { Text, TouchableOpacity, View } from "react-native";

const MOCK_ORDER = {
  farm: "Fetish Farm",
  item: "Onions(1kg)",
  amount: 1000,
};

export default function OrderScreen() {
  const { handlePayment, paymentSuccess } = useOrderPayment(MOCK_ORDER.amount);

  if (paymentSuccess) {
    return (
      <View style={orderStyles.container}>
        <View style={orderStyles.card}>
          <Text style={orderStyles.successEyebrow}>Payed</Text>
          <Text style={orderStyles.title}>Thanks for your order!</Text>
          <Text style={orderStyles.detail}>
            Your order from {MOCK_ORDER.farm} has been confirmed.
          </Text>
          <Text style={orderStyles.detail}>
            {MOCK_ORDER.item} — kr {MOCK_ORDER.amount},-
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={orderStyles.container}>
      <View style={orderStyles.card}>
        <Text style={orderStyles.eyebrow}>Order</Text>
        <Text style={orderStyles.title}>Order Summary</Text>
        <Text style={orderStyles.detail}>{MOCK_ORDER.farm}</Text>
        <Text style={orderStyles.detail}>{MOCK_ORDER.item}</Text>
        <Text style={orderStyles.price}>kr {MOCK_ORDER.amount},-</Text>
        <TouchableOpacity style={orderStyles.button} onPress={handlePayment}>
          <Text style={orderStyles.buttonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
