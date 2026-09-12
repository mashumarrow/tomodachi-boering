import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Timeline } from "@/components/Timeline";
import { formatMinutes, formatSignedMinutes, formatYen, formatYenRange } from "@/lib/format";
import { useSimulation } from "@/hooks/useSimulation";

export default function ReservationScreen() {
  const { hospital, simulation, symptomEstimate, reserve } = useSimulation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>予約確認</Text>
        <Text style={styles.title}>{hospital.name}</Text>
        <Text style={styles.lede}>
          総所要時間は{formatMinutes(simulation.totalMinutes)}、空き時間との差は
          {formatSignedMinutes(simulation.marginMinutes)}です。
        </Text>
      </View>

      <Timeline items={simulation.timeline} />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>症状見積もり</Text>
        <Text style={styles.text}>{symptomEstimate.diagnosis}</Text>
        <Text style={styles.muted}>{symptomEstimate.tests}</Text>
        <Text style={styles.price}>概算自己負担 {formatYenRange(simulation.estimatedCostRange)}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>キャンセル対策</Text>
        <Text style={styles.text}>
          予約確定時に{formatYen(simulation.depositYen)}を先払いします。無断キャンセル・直前キャンセルの場合はキャンセル料として扱い、受診した場合は総額から差し引きます。
        </Text>
      </View>

      <Link href="/payment" asChild>
        <Pressable style={styles.button} onPress={reserve}>
          <Text style={styles.buttonText}>{formatYen(simulation.depositYen)}を先払いして予約する</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 16,
    paddingBottom: 36
  },
  header: {
    gap: 8
  },
  kicker: {
    color: "#28836f",
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: "#25302d",
    fontSize: 30,
    fontWeight: "900"
  },
  lede: {
    color: "#64706d",
    fontSize: 15,
    lineHeight: 24
  },
  panel: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 14
  },
  panelTitle: {
    color: "#25302d",
    fontSize: 16,
    fontWeight: "900"
  },
  text: {
    color: "#25302d",
    fontSize: 15,
    lineHeight: 25
  },
  muted: {
    color: "#64706d",
    fontSize: 14,
    lineHeight: 23
  },
  price: {
    color: "#376996",
    fontSize: 18,
    fontWeight: "900"
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#376996",
    paddingHorizontal: 18
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center"
  }
});
