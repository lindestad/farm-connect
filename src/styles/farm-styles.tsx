import { StyleSheet } from "react-native";

// AI Generated Code - Whole File
const shadow = {
  boxShadow: "0px 18px 40px rgba(26, 41, 30, 0.08)",
} as const;

export const farmStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  heroCard: {
    backgroundColor: "#21432D",
    borderRadius: 28,
    gap: 16,
    padding: 22,
    ...shadow,
  },
  avatarCircle: {
    alignItems: "center",
    backgroundColor: "#F3E6BB",
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: "#21432D",
    fontSize: 22,
    fontWeight: "800",
  },
  heroCopy: {
    gap: 6,
  },
  eyebrow: {
    color: "#B9D1BF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  heroBody: {
    color: "#D8E2DB",
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    ...shadow,
  },
  sectionHeader: {
    gap: 12,
  },
  panelTitle: {
    color: "#182019",
    fontSize: 18,
    fontWeight: "800",
  },
  readonlyGrid: {
    gap: 12,
  },
  readonlyItem: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  readonlyLabel: {
    color: "#5D6A60",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  readonlyMeta: {
    color: "#445148",
    fontSize: 14,
    lineHeight: 20,
  },
  textBlock: {
    gap: 6,
  },
  longValue: {
    color: "#213025",
    fontSize: 15,
    lineHeight: 22,
  },
  inlineButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  inlineButtonText: {
    color: "#214C2D",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  title: {
    color: "#182019",
    fontSize: 22,
    fontWeight: "800",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 18,
    borderWidth: 1,
    color: "#182019",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 120,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2F6A3E",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#7A2A20",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    marginTop: 4,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    padding: 18,
  },
  listEyebrow: {
    color: "#2F6A3E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  searchInput: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 18,
    borderWidth: 1,
    color: "#182019",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    color: "#5D6A60",
    fontSize: 14,
  },
  rowName: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
});
