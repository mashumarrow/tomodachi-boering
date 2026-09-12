import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  tone?: "green" | "orange" | "red" | "blue";
};

const toneColors = {
  green: "#28836f",
  orange: "#b76d10",
  red: "#c95064",
  blue: "#376996"
};

export function MetricCard({ label, value, tone = "green" }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: toneColors[tone] }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 142,
    minHeight: 98,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 14
  },
  label: {
    color: "#64706d",
    fontSize: 12,
    fontWeight: "800"
  },
  value: {
    fontSize: 24,
    fontWeight: "900"
  }
});
