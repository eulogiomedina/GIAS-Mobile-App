import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import API_URL from "../../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ArchivoSeleccionado = {
  uri: string;
  name: string;
  mimeType?: string;
};

export default function PagarScreen() {
  const [tandas, setTandas] = useState<any[]>([]);
  const [selectedTanda, setSelectedTanda] = useState<any | null>(null);
  const [archivo, setArchivo] = useState<ArchivoSeleccionado | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cuentaDestino, setCuentaDestino] = useState<any>(null);
  const [pagos, setPagos] = useState<any[]>([]);
  const router = useRouter();

  // 🔹 Cargar usuario y datos principales
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user._id);
        await fetchAllData(user._id);
      }
    };
    loadUser();
  }, []);

  // 🔄 Obtener todos los datos al iniciar o actualizar
  const fetchAllData = useCallback(async (id: string) => {
    await Promise.all([
      fetchTandas(id),
      fetchPagos(id),
      fetchCuentaDestino(),
    ]);
  }, []);

  const fetchTandas = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/tandas/gestion-cuenta-all/${id}`);
      const data = await res.json();
      setTandas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener tandas:", err);
    }
  };

  const fetchPagos = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/pagos/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) setPagos(data);
    } catch (err) {
      console.error("Error al obtener pagos:", err);
    }
  };

  const fetchCuentaDestino = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cuenta-destino`);
      const data = await res.json();
      setCuentaDestino(data);
    } catch (err) {
      console.error("Error al obtener cuenta destino:", err);
    }
  };

  const handleSelectTanda = (tanda: any) => {
    setSelectedTanda(tanda);
    setArchivo(null);
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setArchivo({
        uri: file.uri,
        name: file.name || "comprobante.jpg",
        mimeType: file.mimeType || "image/jpeg",
      });
    }
  };

  const handleEnviarPago = async () => {
    if (!selectedTanda || !archivo || !userId) {
      Alert.alert("Error", "Selecciona una tanda y un comprobante.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("tandaId", selectedTanda._id);
      formData.append("monto", selectedTanda.monto.toString());
      formData.append("comprobante", {
        uri: archivo.uri,
        name: archivo.name,
        type: archivo.mimeType,
      } as any);

      const response = await fetch(`${API_URL}/pagos`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al enviar el pago.");

      Alert.alert("✅ Éxito", "Comprobante enviado correctamente.");
      fetchPagos(userId);
      router.push({
        pathname: "/PagoExitoso",
        params: {
          tanda: selectedTanda._id,
          user: userId,
          monto: selectedTanda.monto,
          tipo: selectedTanda.tipo,
        },
      });
    } catch (error) {
      console.error("Error al enviar comprobante:", error);
      Alert.alert("Error", "No se pudo enviar el comprobante.");
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPago = async () => {
    if (!selectedTanda || !userId) {
      Alert.alert("Error", "Selecciona una tanda antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/mercadopago/create_preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concepto: `Pago tanda: ${selectedTanda.tipo}`,
          cantidad: 1,
          monto: selectedTanda.monto,
          userId,
          tandaId: selectedTanda._id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.init_point) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }
      Linking.openURL(data.init_point);
    } catch (error) {
      console.error("Error en Mercado Pago:", error);
      Alert.alert("Error", "No se pudo iniciar el pago con Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Actualizar al hacer "pull-to-refresh"
  const onRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await fetchAllData(userId);
    setRefreshing(false);
  };

  const getCardStyle = () => {
    if (!cuentaDestino?.banco) return styles.cardCoppel;
    const banco = cuentaDestino.banco.toLowerCase();
    if (banco.includes("coppel")) return styles.cardCoppel;
    if (banco.includes("bancomer") || banco.includes("bbva")) return styles.cardBlue;
    if (banco.includes("santander")) return styles.cardRed;
    return styles.cardDefault;
  };

  const obtenerEstadoPago = (tanda: any) => {
    if (!tanda?.fechasPago || !userId) return "sinPagar";
    const miRegistro = tanda.fechasPago.find((f: any) => f.userId === userId);

    if (miRegistro?.fechaPago && !miRegistro.fechaRecibo) {
      const pago = pagos.find((p) => p.tandaId?._id === tanda._id);
      if (pago?.estado === "Aprobado") return "pagado";
      if (pago?.estado === "Pendiente") return "pendiente";
      return "pagar";
    }
    if (!miRegistro?.fechaPago && miRegistro?.fechaRecibo) return "recibir";
    return "sinPagar";
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header title="" />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Tus tandas activas</Text>

          {tandas.length > 0 ? (
            tandas.map((tanda) => {
              const estado = obtenerEstadoPago(tanda);
              return (
                <TouchableOpacity
                  key={tanda._id}
                  style={[
                    styles.tandaCard,
                    selectedTanda?._id === tanda._id && styles.tandaSelected,
                  ]}
                  onPress={() => handleSelectTanda(tanda)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.tandaTitle}>
                      {tanda.tipo} - ${tanda.monto}
                    </Text>

                    {estado === "pagado" ? (
                      <Text style={[styles.badge, styles.badgePagado]}>
                        Pagado ✅
                      </Text>
                    ) : estado === "pendiente" ? (
                      <Text style={[styles.badge, styles.badgePendiente]}>
                        Pendiente ⏳
                      </Text>
                    ) : estado === "pagar" ? (
                      <Text style={[styles.badge, styles.badgePagar]}>
                        Pagar 💸
                      </Text>
                    ) : (
                      <Text style={[styles.badge, styles.badgeRecibir]}>
                        Recibir 🎉
                      </Text>
                    )}
                  </View>

                  <Text style={styles.tandaSubtext}>
                    Posición {tanda.orden ?? "-"} /{" "}
                    {Array.isArray(tanda.participantes)
                      ? tanda.participantes.length
                      : 0}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noTandas}>No tienes tandas activas.</Text>
          )}

          {/* 💳 Tarjeta bancaria */}
          {cuentaDestino && (
            <View style={[styles.cardContainer, getCardStyle()]}>
              <View style={styles.cardHeader}>
                <Text style={styles.bankName}>{cuentaDestino.banco?.toUpperCase()}</Text>
                <Text style={styles.bankIcon}>🏦</Text>
              </View>

              <View style={styles.chip}></View>

              {cuentaDestino.numeroTarjeta && (
                <Text style={styles.cardNumber}>
                  {cuentaDestino.numeroTarjeta.replace(/(\d{4})(?=\d)/g, "$1 ")}
                </Text>
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.label}>TITULAR</Text>
                <Text style={styles.cardText}>{cuentaDestino.titular}</Text>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.label}>NÚMERO DE CUENTA</Text>
                <Text style={styles.cardText}>{cuentaDestino.numeroCuenta}</Text>
              </View>

              <Text style={styles.cardFooter}>
                💡 Estos son los datos bancarios para realizar el pago
              </Text>
            </View>
          )}

          {/* 🧾 Sección de pago */}
          {selectedTanda && (
            <View style={styles.paymentBox}>
              <Text style={styles.sectionTitle}>Pagos a realizar</Text>

              <View style={styles.detailBox}>
                <Text style={styles.detailText}>Monto: ${selectedTanda.monto}</Text>
                <Text style={styles.detailText}>Tipo: {selectedTanda.tipo}</Text>
                <Text style={[styles.detailText, styles.totalText]}>
                  TOTAL: ${selectedTanda.monto}
                </Text>
              </View>

              <Text style={styles.subTitle}>Subir comprobante</Text>

              <TouchableOpacity style={styles.fileButton} onPress={handlePickFile}>
                <Text style={styles.fileText}>{archivo?.name ?? "Elegir archivo"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!archivo || loading) && { opacity: 0.6 },
                ]}
                onPress={handleEnviarPago}
                disabled={!archivo || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmText}>Confirmar Pago</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mercadoButton, loading && { opacity: 0.6 }]}
                onPress={handleMercadoPago}
                disabled={loading}
              >
                <Text style={styles.mercadoText}>Pagar con Mercado Pago</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <Footer />
      </View>
    </ProtectedRoute>
  );
}

// 🎨 Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 16,
    marginHorizontal: 16,
    color: "#333",
  },
  tandaCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
  },
  tandaSelected: { borderColor: "#2563eb", backgroundColor: "#e0f2fe" },
  tandaTitle: { fontWeight: "bold", color: "#000" },
  tandaSubtext: { fontSize: 13, color: "#555" },
  noTandas: { textAlign: "center", color: "#666", marginTop: 10 },
  // ... (mantén los estilos existentes)



  cardContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardCoppel: { backgroundColor: "#FFD43B" },
  cardBlue: { backgroundColor: "#3b82f6" },
  cardRed: { backgroundColor: "#ef4444" },
  cardDefault: { backgroundColor: "#64748b" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankName: { fontWeight: "bold", fontSize: 18, color: "#fff" },
  bankIcon: { fontSize: 22, color: "#fff" },
  chip: {
    width: 40,
    height: 28,
    backgroundColor: "#f5c400",
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 10,
  },
  cardNumber: { color: "#fff", fontSize: 18, letterSpacing: 2, marginVertical: 8 },
  cardInfo: { marginTop: 10 },
  label: { fontSize: 12, color: "#f1f5f9", marginBottom: 2 },
  cardText: { fontSize: 14, color: "#fff", fontWeight: "600" },
  cardFooter: {
    fontSize: 11,
    color: "#fef9c3",
    marginTop: 12,
    textAlign: "left",
  },

  paymentBox: {
    backgroundColor: "#e8eaed",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  detailBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    marginBottom: 12,
  },
  detailText: { fontSize: 14, color: "#222", marginVertical: 2 },
  totalText: { textAlign: "center", fontWeight: "bold" },
  subTitle: { fontWeight: "bold", fontSize: 14, marginTop: 8, color: "#333" },
  fileButton: {
    backgroundColor: "#d9d9d9",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  fileText: { fontSize: 14, color: "#333" },

  confirmButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  confirmText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  mercadoButton: {
    backgroundColor: "#FFD43B",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 10,
  },
  mercadoText: { fontWeight: "bold", color: "#000", fontSize: 15 },

  badge: {
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 12,
  },
  badgePagado: { backgroundColor: "#DCFCE7", color: "#15803D" },
  badgePendiente: { backgroundColor: "#FEF3C7", color: "#B45309" },
  badgePagar: { backgroundColor: "#FEE2E2", color: "#B91C1C" },
  badgeRecibir: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
});
