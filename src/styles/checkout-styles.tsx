import { StyleSheet } from "react-native";

export const checkoutStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },
  scroll: {
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 100,
  },
  pageTitle: {
    color: "#182019",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  sectionLabel: {
    color: "#2F6A3E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  produceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  produceInfo: {
    gap: 2,
  },
  produceName: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  produceMeta: {
    color: "#5D6A60",
    fontSize: 13,
  },
  produceRowRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  producePrice: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  removeButton: {
    color: "#9AA89D",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    alignItems: "center",
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingVertical: 14,
  },
  toggleActive: {
    backgroundColor: "#21432D",
    borderColor: "#21432D",
  },
  toggleText: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  toggleSub: {
    color: "#5D6A60",
    fontSize: 12,
  },
  toggleSubActive: {
    color: "#B9D1BF",
  },
  infoBox: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  infoText: {
    color: "#445148",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: "#5D6A60",
    fontSize: 15,
  },
  summaryValue: {
    color: "#445148",
    fontSize: 15,
  },
  divider: {
    backgroundColor: "#DDE4D9",
    height: 1,
  },
  totalLabel: {
    color: "#182019",
    fontSize: 17,
    fontWeight: "800",
  },
  totalValue: {
    color: "#182019",
    fontSize: 17,
    fontWeight: "800",
  },
  footer: {
    backgroundColor: "#F4F5EF",
    borderTopColor: "#DDE4D9",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 18,
    position: "absolute",
    right: 0,
  },
  buyButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#2F6A3E",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    gap: 14,
    padding: 24,
    width: "100%",
  },
  notesInput: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 14,
    borderWidth: 1,
    color: "#182019",
    fontSize: 14,
    minHeight: 72,
    padding: 12,
  },
  reservedTitle: {
    color: "#21432D",
    fontSize: 18,
    fontWeight: "800",
  },
  reservedText: {
    color: "#445148",
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    color: "#182019",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  emptyText: {
    color: "#5D6A60",
    fontSize: 15,
    textAlign: "center",
  },
});
