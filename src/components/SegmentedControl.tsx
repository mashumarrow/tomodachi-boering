import { Pressable, StyleSheet, Text, View } from "react-native";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange
}: Props<T>) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.selectedOption]}
            >
              <Text style={[styles.optionText, selected && styles.selectedText]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8
  },
  label: {
    color: "#3d4946",
    fontSize: 13,
    fontWeight: "800"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  option: {
    minHeight: 42,
    minWidth: 116,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12
  },
  selectedOption: {
    borderColor: "#28836f",
    backgroundColor: "#e6f4ef"
  },
  optionText: {
    color: "#25302d",
    fontSize: 14,
    fontWeight: "700"
  },
  selectedText: {
    color: "#1d6f5d"
  }
});
