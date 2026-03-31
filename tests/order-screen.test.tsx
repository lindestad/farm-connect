import { render, screen } from "@testing-library/react-native";

import OrderScreen from "../src/app/order/order-screen";

const mockUseOrderPayment = jest.fn();

jest.mock("../src/hooks/useOrderPayment", () => ({
  useOrderPayment: () => mockUseOrderPayment(),
}));

describe("Order screen", () => {
  it("renders the order summary before payment", () => {
    mockUseOrderPayment.mockReturnValue({
      handlePayment: jest.fn(),
      paymentSuccess: false,
    });

    render(<OrderScreen />);

    expect(screen.getByText("Order Summary")).toBeTruthy();
    expect(screen.getByText("Pay Now")).toBeTruthy();
  });

  it("renders the success screen after payment", () => {
    mockUseOrderPayment.mockReturnValue({
      handlePayment: jest.fn(),
      paymentSuccess: true,
    });

    render(<OrderScreen />);

    expect(screen.getByText("Thanks for your order!")).toBeTruthy();
    expect(screen.getByText("Payed")).toBeTruthy();
  });
});
