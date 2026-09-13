import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatYen, formatYenRange } from "@/lib/format";
import { useSimulation } from "@/hooks/useSimulation";

export default function PaymentScreen() {
  const { hospital, simulation, reservationStatus, markPaid } = useSimulation();
  const paid = reservationStatus === "paid";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.receipt, paid && styles.paidReceipt]}>
        <Text style={styles.kicker}>{paid ? "予約完了" : "事前決済モック"}</Text>
        <Text style={styles.title}>{paid ? "先払いが完了しました" : formatYen(simulation.depositYen)}</Text>
        <Text style={styles.text}>
          {hospital.name} の予約料 / 初診基本料として処理します。窓口精算の目安は
          {formatYenRange(simulation.remainingPaymentRange)}です。
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>決済仕様</Text>
        <Text style={styles.text}>
          本番ではStripe等の決済サービスをバックエンド経由で呼び出します。カード情報やAI APIキーはアプリ内に持たせません。
        </Text>
      </View>

      <Pressable style={[styles.button, paid && styles.disabledButton]} onPress={markPaid} disabled={paid}>
        <Text style={styles.buttonText}>{paid ? "決済済み" : "モック決済を完了する"}</Text>
      </Pressable>

      <Link href="/" asChild>
        <Pressable style={StyleSheet.flatten([styles.button, styles.secondaryButton])}>
          <Text style={StyleSheet.flatten([styles.buttonText, styles.secondaryButtonText])}>
            条件入力に戻る
          </Text>
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
  receipt: {
    gap: 10,
    borderRadius: 8,
    backgroundColor: "#376996",
    padding: 18
  },
  paidReceipt: {
    backgroundColor: "#28836f"
  },
  kicker: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900"
  },
  text: {
    color: "#25302d",
    fontSize: 15,
    lineHeight: 25
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
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#376996",
    paddingHorizontal: 18
  },
  disabledButton: {
    backgroundColor: "#64706d"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#376996",
    backgroundColor: "#ffffff"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center"
  },
  secondaryButtonText: {
    color: "#376996"
  }
});
