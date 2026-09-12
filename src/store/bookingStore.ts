import { create } from "zustand";
import { hospitals, origins } from "@/data/campus";
import type { Hospital, Origin, TransportMode } from "@/domain/types";

type BookingState = {
  origin: Origin;
  hospital: Hospital;
  transportMode: TransportMode;
  availableMinutes: number;
  symptoms: string;
  needsPharmacy: boolean;
  reservationStatus: "draft" | "reserved" | "paid";
  setOrigin: (origin: Origin) => void;
  setHospital: (hospital: Hospital) => void;
  setTransportMode: (transportMode: TransportMode) => void;
  setAvailableMinutes: (availableMinutes: number) => void;
  setSymptoms: (symptoms: string) => void;
  setNeedsPharmacy: (needsPharmacy: boolean) => void;
  reserve: () => void;
  markPaid: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  origin: origins[0],
  hospital: hospitals[0],
  transportMode: "bike",
  availableMinutes: 90,
  symptoms: "",
  needsPharmacy: true,
  reservationStatus: "draft",
  setOrigin: (origin) => set({ origin }),
  setHospital: (hospital) => set({ hospital }),
  setTransportMode: (transportMode) => set({ transportMode }),
  setAvailableMinutes: (availableMinutes) => set({ availableMinutes }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setNeedsPharmacy: (needsPharmacy) => set({ needsPharmacy }),
  reserve: () => set({ reservationStatus: "reserved" }),
  markPaid: () => set({ reservationStatus: "paid" })
}));
