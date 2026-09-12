import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { MetricCard } from "@/components/MetricCard";
import { OsmMap } from "@/components/OsmMap";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Timeline } from "@/components/Timeline";
import { fallbackHospitals, fetchNearbyHospitals, filterHospitalsByDepartment } from "@/api/mockApi";
import { origins } from "@/data/campus";
import { medicalDepartmentOptions } from "@/data/medicalDepartments";
import type { MedicalDepartment, Origin, TransportMode } from "@/domain/types";
import { formatMinutes, formatSignedMinutes, formatYen, formatYenRange } from "@/lib/format";
import { useSimulation } from "@/hooks/useSimulation";

const transportOptions: Array<{ label: string; value: TransportMode }> = [
  { label: "自転車", value: "bike" },
  { label: "徒歩", value: "walk" },
  { label: "自動車・原付", value: "car" },
  { label: "路線バス", value: "bus" }
];

export default function HomeScreen() {
  const [locationMessage, setLocationMessage] = useState("初期位置は宮崎大学 木花キャンパスです。");
  const [selectedDepartment, setSelectedDepartment] = useState<MedicalDepartment>("all");
  const {
    origin,
    transportMode,
    availableMinutes,
    symptoms,
    needsPharmacy,
    hospital,
    symptomEstimate,
    simulation,
    setOrigin,
    setHospital,
    setTransportMode,
    setAvailableMinutes,
    setSymptoms,
    setNeedsPharmacy
  } = useSimulation();

  const nearbyHospitalsQuery = useQuery({
    queryKey: ["nearby-hospitals", origin.coordinates.latitude, origin.coordinates.longitude],
    queryFn: () => fetchNearbyHospitals(origin.coordinates),
    staleTime: 1000 * 60 * 10,
    retry: 1
  });
  const allHospitalCandidates = nearbyHospitalsQuery.data ?? fallbackHospitals(origin.coordinates);
  const hospitalCandidates = filterHospitalsByDepartment(allHospitalCandidates, selectedDepartment);

  useEffect(() => {
    if (hospitalCandidates.length > 0 && !hospitalCandidates.some((item) => item.id === hospital.id)) {
      setHospital(hospitalCandidates[0]);
    }
  }, [hospital.id, hospitalCandidates, setHospital]);

  const statusColor =
    simulation.fit === "ok" ? "#28836f" : simulation.fit === "tight" ? "#f0a13a" : "#c95064";
  const statusTitle =
    simulation.fit === "ok"
      ? "この空き時間で受診できる見込みです"
      : simulation.fit === "tight"
        ? "かなりぎりぎりです"
        : "この空き時間では戻れない可能性が高いです";

  async function useCurrentLocation() {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        setLocationMessage("端末またはブラウザの位置情報サービスがオフです。設定から位置情報を有効にしてください。");
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLocationMessage("現在地の利用が許可されませんでした。ブラウザまたはExpo Goの位置情報権限を許可してください。");
        return;
      }

      const current =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        }));
      const currentOrigin: Origin = {
        id: "current_location",
        name: "現在地",
        coordinates: {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude
        }
      };

      setOrigin(currentOrigin);
      setLocationMessage("現在地を出発地に設定しました。周辺の医療機関を再取得しています。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー";
      setLocationMessage(`現在地を取得できませんでした: ${message}`);
    }
  }

  function resetToMiyazakiUniversity() {
    setOrigin(origins[0]);
    setLocationMessage("宮崎大学 木花キャンパスを出発地に設定しました。");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Campus Med-Timer</Text>
        <Text style={styles.title}>現在地から受診できる病院を探す</Text>
        <Text style={styles.lede}>
          宮崎大学周辺を起点に、現在地、OpenStreetMapの医療機関、移動時間、待ち時間、診察、薬局受け取りをまとめて見積もります。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>出発地</Text>
        <View style={styles.originPanel}>
          <View style={styles.originText}>
            <Text style={styles.label}>現在の出発地</Text>
            <Text style={styles.originName}>{origin.name}</Text>
            <Text style={styles.muted}>
              {origin.coordinates.latitude.toFixed(5)}, {origin.coordinates.longitude.toFixed(5)}
            </Text>
          </View>
          <View style={styles.originActions}>
            <Pressable style={styles.button} onPress={useCurrentLocation}>
              <Text style={styles.buttonText}>現在地を使う</Text>
            </Pressable>
            <Pressable
              style={StyleSheet.flatten([styles.button, styles.secondaryButton])}
              onPress={resetToMiyazakiUniversity}
            >
              <Text style={StyleSheet.flatten([styles.buttonText, styles.secondaryButtonText])}>
                宮崎大学に戻す
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.muted}>{locationMessage}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>周辺の医療機関</Text>
        <Text style={styles.muted}>
          OpenStreetMapから半径8kmの病院・クリニック・診療所を取得します。取得できない場合は宮崎大学周辺の候補を表示します。
        </Text>
        <SegmentedControl
          label="診療科"
          options={medicalDepartmentOptions}
          value={selectedDepartment}
          onChange={setSelectedDepartment}
        />
        {nearbyHospitalsQuery.isFetching ? <Text style={styles.loading}>周辺医療機関を取得中...</Text> : null}
        {nearbyHospitalsQuery.isError ? (
          <Text style={styles.warning}>OpenStreetMapから取得できなかったため、フォールバック候補を表示しています。</Text>
        ) : null}
        {hospitalCandidates.length === 0 ? (
          <Text style={styles.warning}>この診療科の候補が周辺に見つかりませんでした。診療科を「すべて」に戻して確認してください。</Text>
        ) : null}
        <View style={styles.hospitalList}>
          {hospitalCandidates.map((item) => (
            <Pressable
              key={item.id}
              style={StyleSheet.flatten([
                styles.hospitalButton,
                item.id === hospital.id && styles.selectedHospital
              ])}
              onPress={() => setHospital(item)}
            >
              <View style={styles.hospitalHeader}>
                <Text style={styles.hospitalName}>{item.name}</Text>
                <Text style={styles.distance}>
                  {item.distanceMeters ? `${(item.distanceMeters / 1000).toFixed(1)}km` : "距離計算中"}
                </Text>
              </View>
              <Text style={styles.muted}>
                {item.department} / {item.address}
              </Text>
            </Pressable>
          ))}
        </View>

        <SegmentedControl
          label="移動手段"
          options={transportOptions}
          value={transportMode}
          onChange={setTransportMode}
        />

        <View style={styles.inputBlock}>
          <Text style={styles.label}>空き時間</Text>
          <TextInput
            keyboardType="number-pad"
            value={String(availableMinutes)}
            onChangeText={(text) => setAvailableMinutes(Number(text.replace(/\D/g, "")) || 0)}
            style={styles.input}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>薬局で薬を受け取る</Text>
          <Switch
            value={needsPharmacy}
            onValueChange={setNeedsPharmacy}
            trackColor={{ false: "#d9ddd6", true: "#9ad3c3" }}
            thumbColor={needsPharmacy ? "#28836f" : "#ffffff"}
          />
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>現在の症状</Text>
          <TextInput
            multiline
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="例：昨日から38度の熱があり、のどが痛い。薬もほしい。"
            placeholderTextColor="#8a9692"
            style={[styles.input, styles.textarea]}
          />
        </View>
      </View>

      <View style={[styles.status, { backgroundColor: statusColor }]}>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusText}>
          空き時間との差は{formatSignedMinutes(simulation.marginMinutes)}です。
        </Text>
      </View>

      <View style={styles.metrics}>
        <MetricCard label="総所要時間" value={formatMinutes(simulation.totalMinutes)} />
        <MetricCard
          label="空き時間との差"
          value={formatSignedMinutes(simulation.marginMinutes)}
          tone={simulation.fit === "over" ? "red" : simulation.fit === "tight" ? "orange" : "green"}
        />
        <MetricCard label="概算自己負担" value={formatYenRange(simulation.estimatedCostRange)} tone="blue" />
        <MetricCard label="予約時先払い" value={formatYen(simulation.depositYen)} tone="orange" />
      </View>

      <View style={styles.mapCard}>
        <OsmMap
          origin={origin.coordinates}
          destination={hospital.coordinates}
          originLabel={origin.name}
          destinationLabel={hospital.name}
        />
      </View>

      <Timeline items={simulation.timeline} />

      <View style={styles.detail}>
        <Text style={styles.detailTitle}>AI症状見積もり</Text>
        <Text style={styles.detailText}>{symptomEstimate.diagnosis}</Text>
        <Text style={styles.muted}>{symptomEstimate.tests}</Text>
      </View>

      <View style={styles.detail}>
        <Text style={styles.detailTitle}>予約・事前決済</Text>
        <Text style={styles.detailText}>
          予約確定時に{formatYen(simulation.depositYen)}を先払いします。受診後の窓口精算は
          {formatYenRange(simulation.remainingPaymentRange)}程度です。
        </Text>
        <View style={styles.actions}>
          <Link href={`/hospitals/${hospital.id}`} asChild>
            <Pressable style={StyleSheet.flatten([styles.button, styles.secondaryButton])}>
              <Text style={StyleSheet.flatten([styles.buttonText, styles.secondaryButtonText])}>
                病院詳細
              </Text>
            </Pressable>
          </Link>
          <Link href="/reservation" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>予約へ進む</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        OpenStreetMapの施設情報は登録状況に依存します。表示金額と傷病名は事前見積もりであり、医師の診断、検査内容、処方、保険証確認により実際の支払額は変動します。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 16,
    paddingBottom: 36
  },
  hero: {
    gap: 10,
    paddingVertical: 8
  },
  eyebrow: {
    color: "#28836f",
    fontSize: 12,
    fontWeight: "900"
  },
  title: {
    color: "#25302d",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40
  },
  lede: {
    color: "#64706d",
    fontSize: 15,
    lineHeight: 25
  },
  section: {
    gap: 16,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#fffdf8",
    padding: 14
  },
  sectionTitle: {
    color: "#25302d",
    fontSize: 18,
    fontWeight: "900"
  },
  originPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 12
  },
  originText: {
    gap: 4
  },
  originName: {
    color: "#25302d",
    fontSize: 20,
    fontWeight: "900"
  },
  originActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  hospitalList: {
    gap: 8
  },
  hospitalButton: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 12
  },
  selectedHospital: {
    borderColor: "#28836f",
    backgroundColor: "#e6f4ef"
  },
  hospitalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  hospitalName: {
    flex: 1,
    color: "#25302d",
    fontSize: 16,
    fontWeight: "900"
  },
  distance: {
    color: "#376996",
    fontSize: 14,
    fontWeight: "900"
  },
  inputBlock: {
    gap: 8
  },
  label: {
    color: "#3d4946",
    fontSize: 13,
    fontWeight: "800"
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    color: "#25302d",
    padding: 12,
    fontSize: 16
  },
  textarea: {
    minHeight: 118,
    textAlignVertical: "top"
  },
  switchRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 6,
    backgroundColor: "#eef5f1",
    paddingHorizontal: 12
  },
  status: {
    borderRadius: 8,
    padding: 14
  },
  statusTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900"
  },
  statusText: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700"
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  mapCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#f7f3ea"
  },
  detail: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#d9ddd6",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 14
  },
  detailTitle: {
    color: "#25302d",
    fontSize: 16,
    fontWeight: "900"
  },
  detailText: {
    color: "#25302d",
    fontSize: 15,
    lineHeight: 25
  },
  muted: {
    color: "#64706d",
    fontSize: 14,
    lineHeight: 23
  },
  loading: {
    color: "#376996",
    fontSize: 14,
    fontWeight: "900"
  },
  warning: {
    color: "#c95064",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 22
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6
  },
  button: {
    minHeight: 48,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#376996",
    paddingHorizontal: 18
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
  },
  disclaimer: {
    color: "#64706d",
    fontSize: 12,
    lineHeight: 20
  }
});
