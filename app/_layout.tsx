import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#f3f0e8" },
          headerStyle: { backgroundColor: "#fffdf8" },
          headerTintColor: "#25302d",
          headerTitleStyle: { fontWeight: "900" }
        }}
      >
        <Stack.Screen name="index" options={{ title: "Campus Med-Timer" }} />
        <Stack.Screen name="hospitals/[id]" options={{ title: "病院詳細" }} />
        <Stack.Screen name="reservation" options={{ title: "予約確認" }} />
        <Stack.Screen name="payment" options={{ title: "事前決済" }} />
      </Stack>
    </QueryClientProvider>
  );
}
