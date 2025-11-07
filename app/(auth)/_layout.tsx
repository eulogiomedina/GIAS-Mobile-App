import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AuthTabs() {
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
        name="login"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: "Registro",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="login-password"
        options={{
          href: null, // 👈 Esto la oculta del TabBar
        }}
      />
      <Tabs.Screen
        name="send-code"
        options={{
          href: null, // 👈 Esto la oculta del TabBar
        }}
      />
      <Tabs.Screen
        name="verify-code"
        options={{
          href: null, // 👈 Esto la oculta del TabBar
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null, // 👈 Esto la oculta del TabBar
        }}
      />
      

    </Tabs>

  );
}
