import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProtectedRoute from "../../components/ProtectedRoute";
import API_URL from "../../../config/apiConfig";
import { AuthContext } from "../../../contexts/AuthContext";

type Participante =
  | { userId: string }
  | { userId: { _id: string; nombre?: string; apellidos?: string } };

type FechaPago = {
  userId: string;
  fechaPago: string | null;
  fechaRecibo: string | null;
};

type TandaDetalle = {
  _id: string;
  monto: number;
  tipo: string;
  fechaInicio: string | null;
  diaPago?: string;
  participantes: Participante[];
  totalCiclos?: number;
  fechasPago: FechaPago[];
  posicionUsuario?: number;
  faltantesParaLlenarse?: number;
};

export default function DetalleTanda() {
  // se recibe pero NO se usa para pedir al backend en Opción A
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useContext(AuthContext);
  const userId = (user?._id || user?._id) as string | undefined;

  const [tanda, setTanda] = useState<TandaDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const formatFecha = (fechaISO?: string | null) => {
    if (!fechaISO) return "Pendiente";
    const d = new Date(fechaISO);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
  const load = async () => {
    if (!id) return;

    try {
      const res = await fetch(`${API_URL}/api/tandas/${id}`);
      const data = await res.json();
      if (res.ok) setTanda(data);
      else setTanda(null);
    } catch (e) {
      console.error("❌ Error al cargar detalles de tanda:", e);
      setTanda(null);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [id]);


  // fechas del usuario
  const fechaPagoUsuario = formatFecha(
    tanda?.fechasPago?.find((fp) => String(fp.userId) === String(userId) && fp.fechaPago)?.fechaPago
  );

  const fechaReciboUsuario = formatFecha(
    tanda?.fechasPago
      ?.filter((fp) => String(fp.userId) === String(userId) && fp.fechaRecibo)
      ?.sort((a, b) => new Date(a.fechaRecibo!).getTime() - new Date(b.fechaRecibo!).getTime())[0]
      ?.fechaRecibo
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <Header title="" />
          <ActivityIndicator size="large" color="#0F2B45" style={{ marginTop: 20 }} />
          <Footer />
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header title="" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {/* Monto */}
            <View style={styles.row}>
              <Ionicons name="cash-outline" size={26} color="#0F2B45" style={styles.icon} />
              <Text style={styles.label}>Monto:</Text>
              <Text style={styles.value}>${tanda?.monto ?? "-"}</Text>
            </View>

            {/* Tipo */}
            <View style={styles.row}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#0F2B45" style={styles.icon} />
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{tanda?.tipo ?? "-"}</Text>
            </View>

            {/* Fecha de pago */}
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={24} color="#0F2B45" style={styles.icon} />
              <Text style={styles.label}>Tu fecha de pago:</Text>
              <Text style={styles.valueStrong}>{fechaPagoUsuario}</Text>
            </View>

            {/* Fecha en que recibes */}
            <View style={styles.row}>
              <Ionicons name="gift-outline" size={24} color="#0F2B45" style={styles.icon} />
              <Text style={styles.label}>Fecha en que recibes:</Text>
              <Text style={styles.valueStrong}>{fechaReciboUsuario}</Text>
            </View>

            {/* Turno */}
            <View style={styles.row}>
              <Ionicons name="finger-print-outline" size={24} color="#0F2B45" style={styles.icon} />
              <Text style={styles.label}>Tu turno:</Text>
              <Text style={styles.value}>{tanda?.posicionUsuario ?? "Pendiente"}</Text>
            </View>

            {/* Faltantes */}
            <View style={styles.row}>
              <Ionicons name="people-outline" size={24} color="#0F2B45" style={styles.icon} />
              <Text style={styles.label}>Faltan para llenarse:</Text>
              <Text style={styles.value}>{tanda?.faltantesParaLlenarse ?? "-"}</Text>
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
  content: { padding: 16, paddingBottom: 110 },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  icon: { marginRight: 10 },
  label: { fontSize: 18, color: "#0F2B45", fontWeight: "700", flex: 1 },
  value: { fontSize: 18, color: "#111827", fontWeight: "600" },
  valueStrong: { fontSize: 18, color: "#111827", fontWeight: "800" },
});
