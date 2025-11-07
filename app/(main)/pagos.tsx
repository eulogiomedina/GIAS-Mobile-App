import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import API_URL from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";

type Pago = {
  _id: string;
  monto: number;
  estado: "Aprobado" | "Pendiente" | "Rechazado";
  metodo: string;
  fechaPago: string;
  tandaId?: { monto: number; tipo: string };
};

export default function PagosScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?._id || user?.id;

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPagos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pagos/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setPagos(data);
    } catch (error) {
      console.error("❌ Error al obtener pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPagos();
    setRefreshing(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return { bg: "#DCFCE7", color: "#15803D", icon: "checkmark-circle" };
      case "Pendiente":
        return { bg: "#FEF9C3", color: "#B45309", icon: "time-outline" };
      case "Rechazado":
        return { bg: "#FEE2E2", color: "#B91C1C", icon: "close-circle" };
      default:
        return { bg: "#E0E7FF", color: "#1E3A8A", icon: "information-circle" };
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header title="" />

        <Text style={styles.title}>Historial de Pagos</Text>

        {loading ? (
          <ActivityIndicator color="#0F2B45" size="large" style={{ marginTop: 20 }} />
        ) : pagos.length > 0 ? (
          <ScrollView
            style={styles.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {pagos.map((pago) => {
              const estado = getEstadoColor(pago.estado);
              return (
                <View key={pago._id} style={[styles.card, { backgroundColor: estado.bg }]}>
                  <View style={styles.row}>
                    <Ionicons name={estado.icon as any} size={26} color={estado.color} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.monto, { color: estado.color }]}>
                        ${pago.monto}
                      </Text>
                      <Text style={styles.text}>
                        {pago.tandaId
                          ? `${pago.tandaId.tipo} - ${pago.tandaId.monto}`
                          : "Sin tanda asociada"}
                      </Text>
                      <Text style={styles.text}>Método: {pago.metodo}</Text>
                      <Text style={styles.fecha}>
                        {new Date(pago.fechaPago).toLocaleString("es-MX")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.estadoBox}>
                    <Text style={[styles.estado, { color: estado.color }]}>
                      {pago.estado}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noPagos}>No tienes pagos registrados aún.</Text>
        )}

        <Footer />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F2B45",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center" },
  monto: { fontSize: 18, fontWeight: "700" },
  text: { fontSize: 13, color: "#374151", marginTop: 2 },
  fecha: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  estadoBox: { alignItems: "flex-end", marginTop: 6 },
  estado: { fontWeight: "bold", fontSize: 14 },
  noPagos: { textAlign: "center", marginTop: 50, color: "#6b7280" },
});
