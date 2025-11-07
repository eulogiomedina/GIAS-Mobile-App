import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MainTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F2B45",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "white" },
      }}
    >
      <Tabs.Screen
        name="ahorro"
        options={{
          title: "Ahorros",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pagos"
        options={{
          title: "Pagos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pagar"
        options={{
          title: "Pagar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🔒 RUTAS INTERNAS (sin icono en la barra inferior) */}
      <Tabs.Screen
        name="detalle-tanda/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="validaciones-tanda"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="(hidden)/PagoExitoso"
        options={{ href: null }} // ✅ Esto oculta completamente la ruta
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          href: null, // 🚫 No aparecerá en la barra de tabs
        }}
      />
    </Tabs>
  );
}
