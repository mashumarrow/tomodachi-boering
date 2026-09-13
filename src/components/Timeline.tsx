import { StyleSheet, Text, View } from "react-native";
import type { TimelineItem } from "@/domain/types";
import { formatMinutes } from "@/lib/format";

type Props = {
  items: TimelineItem[];
};

export function Timeline({ items }: Props) {
  const max = Math.max(...items.map((item) => item.minutes), 1);

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.track}>
            <View
              style={[
                styles.bar,
                {
                  backgroundColor: item.color,
                  width: `${Math.max(7, (item.minutes / max) * 100)}%`
                }
              ]}
            />
          </View>
          <Text style={styles.minutes}>{formatMinutes(item.minutes)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8
  },
  row: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 10,
    gap: 8
  },
  label: {
    color: "#64706d",
    fontSize: 12,
    fontWeight: "800"
  },
  track: {
    height: 12,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: "#edf0ec"
  },
  bar: {
    height: "100%",
    borderRadius: 99
  },
  minutes: {
    color: "#25302d",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  }
});
