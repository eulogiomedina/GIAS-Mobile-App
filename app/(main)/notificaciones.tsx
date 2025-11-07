// app/(main)/NotificacionesScreen.tsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import API_URL from "../../config/apiConfig";

interface Notificacion {
  _id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

export default function NotificacionesScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?._id || user?.id;

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotificaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/movil/notificaciones/${userId}`);
      const data: Notificacion[] = await res.json();
      if (Array.isArray(data)) setNotificaciones(data);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const marcarComoLeida = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/movil/notificaciones/${id}/leida`, {
        method: "PUT",
      });
      setNotificaciones((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotificaciones();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 10000);
    return () => clearInterval(interval);
  }, [fetchNotificaciones]);

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* 🔹 Franja azul decorativa junto al título */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}></Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="#0F2B45" size="large" style={{ marginTop: 40 }} />
          ) : notificaciones.length > 0 ? (
            <FlatList
              data={notificaciones}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => marcarComoLeida(item._id)}
                >
                  <View style={styles.iconBox}>
                    <Ionicons
                      name={
                        item.tipo === "pago_exitoso"
                          ? "checkmark-circle"
                          : item.tipo === "pago_rechazado"
                          ? "close-circle"
                          : item.tipo === "recordatorio_pago"
                          ? "time-outline"
                          : "notifications"
                      }
                      size={30}
                      color={
                        item.tipo === "pago_exitoso"
                          ? "#16a34a"
                          : item.tipo === "pago_rechazado"
                          ? "#dc2626"
                          : item.tipo === "recordatorio_pago"
                          ? "#facc15"
                          : "#0F2B45"
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.titulo}>{item.titulo}</Text>
                    <Text style={styles.mensaje}>{item.mensaje}</Text>
                    <Text style={styles.fecha}>
                      {new Date(item.fecha).toLocaleString("es-MX")}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noNotificaciones}>
              No tienes notificaciones por ahora 📭
            </Text>
          )}
        </View>

        {/* Footer fijo al fondo */}
        <Footer />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE",
  },
  headerBar: {
    backgroundColor: "#0F2B45",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 80, // espacio para footer
  },
  listContent: { paddingBottom: 80 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconBox: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: { fontWeight: "700", fontSize: 16, color: "#0F2B45" },
  mensaje: { fontSize: 14, color: "#374151", marginTop: 2 },
  fecha: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  noNotificaciones: {
    textAlign: "center",
    marginTop: 60,
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "600",
  },
});
