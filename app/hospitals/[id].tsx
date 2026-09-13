import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { hospitals } from "@/data/campus";
import { formatMinutes } from "@/lib/format";
import { useBookingStore } from "@/store/bookingStore";

export default function HospitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const selectedHospital = useBookingStore((state) => state.hospital);
  const setHospital = useBookingStore((state) => state.setHospital);
  const hospital =
    selectedHospital.id === id
      ? selectedHospital
      : hospitals.find((item) => item.id === id) ?? selectedHospital;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.department}>{hospital.department}</Text>
        <Text style={styles.title}>{hospital.name}</Text>
        <Text style={styles.address}>{hospital.address}</Text>
      </View>

      <View style={styles.grid}>
        <Info label="現在の混雑" value={hospital.congestion === "high" ? "混雑" : "通常"} />
        <Info label="予測待ち時間" value={formatMinutes(hospital.waitMinutes)} />
        <Info label="診察目安" value={formatMinutes(hospital.examMinutes)} />
        <Info label="薬局目安" value={formatMinutes(hospital.pharmacyMinutes)} />
      </View>

      <Text style={styles.note}>
        待ち時間は予約枠の消化状況を想定したモック値です。実運用では病院側の受付システム、予約台帳、薬局連携データから更新します。
      </Text>

      <Link href="/reservation" asChild>
        <Pressable
          style={styles.button}
          onPress={() => {
            setHospital(hospital);
          }}
        >
          <Text style={styles.buttonText}>この病院で予約する</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  department: {
    color: "#28836f",
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: "#25302d",
    fontSize: 30,
    fontWeight: "900"
  },
  address: {
    color: "#64706d",
    fontSize: 15
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  info: {
    minWidth: 150,
    flex: 1,
    minHeight: 96,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 14
  },
  infoLabel: {
    color: "#64706d",
    fontSize: 12,
    fontWeight: "800"
  },
  infoValue: {
    color: "#25302d",
    fontSize: 24,
    fontWeight: "900"
  },
  note: {
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#fffdf8",
    color: "#64706d",
    fontSize: 14,
    lineHeight: 23,
    padding: 14
  },
  button: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#376996",
    paddingHorizontal: 18
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  }
});
