import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  // ⏳ Mientras verifica si hay sesión
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0F2B45" />
        <Text style={{ color: "#0F2B45", marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  // 🔒 Si no hay sesión
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>
          ⚠️ Debes iniciar sesión o autenticarte con huella para acceder.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/login")}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Si hay sesión
  return children;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  warning: { fontSize: 16, marginBottom: 20, color: "#0F2B45", textAlign: "center" },
  button: { backgroundColor: "#0F2B45", padding: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
