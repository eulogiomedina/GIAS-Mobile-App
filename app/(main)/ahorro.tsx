import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import API_URL from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";

type Tanda = {
  _id: string;
  monto: number;
  tipo: "Semanal" | "Quincenal" | "Mensual" | string;
  fechaInicio: string | null;
};

export default function AhorroScreen() {
  const { user } = useContext(AuthContext);
  const userId = (user?.id || user?._id) as string | undefined;

  const router = useRouter();

  const [tandas, setTandas] = useState<Tanda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const formatFecha = (fechaISO?: string | null) => {
    if (!fechaISO) return "Sin fecha";
    const d = new Date(fechaISO);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const fetchTandas = useCallback(async () => {
    if (!userId) {
      setTandas([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tandas/gestion-cuenta-all/${userId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTandas(data);
      } else {
        setTandas([]);
      }
    } catch (err) {
      console.error("❌ Error al obtener tandas:", err);
      setTandas([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTandas();
  }, [fetchTandas]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTandas();
    setRefreshing(false);
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header title="" />

        {/* ✅ SubHeader */}
        <View style={styles.subHeader}>
          <Text style={styles.welcomeText}>Bienvenido, {user?.nombre || "usuario"}</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Contenido con Scroll */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* 🔷 CONTENEDOR DE TANDAS ACTIVAS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tandas activas</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#0F2B45" style={{ marginTop: 20 }} />
            ) : tandas.length > 0 ? (
              tandas.map((t) => (
                <TouchableOpacity
                  key={t._id}
                  style={styles.card}
                  onPress={() =>
                    router.push({ pathname: "/detalle-tanda/[id]", params: { id: t._id } })
                  }
                >
                  <View style={styles.circle}>
                    <Text style={styles.amount}>${t.monto}</Text>
                    <Text style={styles.frequency}>{t.tipo}</Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Ionicons name="calendar" size={18} color="#0F2B45" />
                    <Text style={styles.startText}>
                      <Text style={styles.bold}>Inicio:</Text> {formatFecha(t.fechaInicio)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No tienes tandas activas</Text>
            )}
          </View>

          {/* 🔷 CONTENEDOR PARA INGRESAR A UNA TANDA */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingresar a una tanda</Text>

                      {/* 🔷 CONTENEDOR PARA INGRESAR A UNA TANDA */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ingresar a una tanda</Text>

              <View style={styles.buttonGrid}>
                {[
                  { monto: "345", tipo: "Semanal" },
                  { monto: "1000", tipo: "Semanal" },
                  { monto: "2500", tipo: "Mensual" },
                  { monto: "3400", tipo: "Mensual" },
                ].map((plan) => (
                  <TouchableOpacity
                    key={plan.monto}
                    style={styles.optionButton}
                    onPress={() =>
                      router.push({
                        pathname: "/validaciones-tanda",
                        params: { monto: plan.monto, tipo: plan.tipo },
                      })
                    }
                  >
                    <Text style={styles.optionText}>
                      {plan.monto} {plan.tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        </ScrollView>

        <Footer />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  subHeader: {
    backgroundColor: "#0F2B45",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  welcomeText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  iconContainer: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 15 },

  scrollContent: { padding: 16, paddingBottom: 110 },

  // 🔷 Contenedor general
  sectionContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F2B45",
    marginBottom: 12,
  },

  noDataText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 8,
  },

  // 🔵 Card de tanda
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  amount: { color: "#fff", fontSize: 18, fontWeight: "800" },
  frequency: { color: "#E7F1FF", fontSize: 12, marginTop: 2, fontWeight: "600" },

  infoBox: { flexDirection: "row", alignItems: "center" },
  startText: { fontSize: 15, color: "#0F2B45", marginLeft: 6 },
  bold: { fontWeight: "700" },

  // 🔵 Botones de selección de tipo de tanda
  buttonGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  optionButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 10,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },
  optionText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

