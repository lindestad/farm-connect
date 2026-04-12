import { StyleSheet } from "react-native";

export const produceStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F3",
    padding: 18,
    paddingTop: 32,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F6F7F3",
  },
  scrollContent: {
    padding: 18,
    paddingTop: 32,
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    overflow: "hidden",
    boxShadow: "0px 18px 30px rgba(24, 32, 25, 0.08)",
  },
  title: {
    color: "#182019",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  detail: {
    color: "#5D6A60",
    fontSize: 15,
    lineHeight: 23,
  },
  produceItem: {
    paddingVertical: 14,
  },
  produceName: {
    color: "#182019",
    fontSize: 16,
    fontWeight: "600",
  },
  metaBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 16,
    gap: 4,
    backgroundColor: "#F8FAF6",
  },
  metaText: {
    color: "#5D6A60",
    fontSize: 14,
  },
  linkButton: {
    paddingVertical: 4,
  },
  linkText: {
    color: "#2F6A3E",
    fontSize: 15,
    fontWeight: "600",
  },
  nutritionTable: {
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  tableTitle: {
    color: "#182019",
    fontSize: 18,
    fontWeight: "700",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDE4D9",
    backgroundColor: "#F8FAF6",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2EC",
  },
  nutritionLabel: {
    color: "#182019",
    fontSize: 15,
  },
  nutritionValue: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "#B42318",
  },
  listContent: {
    paddingBottom: 12,
  },
});
