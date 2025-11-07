import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API_URL from "../../../config/apiConfig";

export default function PagoExitoso() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const tandaId = params.tanda as string | undefined;
  const userId = params.user as string | undefined;
  const monto = params.monto as string | undefined;
  const tipo = params.tipo as string | undefined;

  const [guardado, setGuardado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fecha = new Date().toLocaleString();

  // 🔹 Animación del círculo verde
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  const animateSuccess = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const registrarPago = async () => {
      if (tandaId && userId && monto && !guardado) {
        try {
          const res = await fetch(`${API_URL}/api/pagos/mercadopago`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tandaId,
              userId,
              monto: Number(monto),
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Error al guardar el pago.");
          setMensaje("✅ Pago guardado correctamente en tu historial.");
          setGuardado(true);
        } catch (err: any) {
          setError(err.message || "Error al guardar el pago.");
        } finally {
          setLoading(false);
          animateSuccess();
        }
      } else {
        setLoading(false);
        animateSuccess();
      }
    };
    registrarPago();
  }, [tandaId, userId, monto]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Procesando pago...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>¡Pago realizado correctamente!</Text>
        <Text style={styles.subtitle}>Tu pago fue aprobado y procesado con éxito.</Text>

        {mensaje ? <Text style={styles.successMsg}>{mensaje}</Text> : null}
        {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen del pago</Text>
          <Text style={styles.cardText}>Tanda: {tipo || "No disponible"}</Text>
          <Text style={styles.cardText}>Monto pagado: ${monto || "0"} MXN</Text>
          <Text style={styles.cardText}>ID Tanda: {tandaId || "—"}</Text>
          <Text style={styles.cardText}>Fecha y hora: {fecha}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(main)/pagar")}
        >
          <Text style={styles.buttonText}>Regresar a Pagos</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  // ✅ Círculo verde animado
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  checkmark: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#15803d",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 16,
    textAlign: "center",
  },
  successMsg: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  errorMsg: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    borderColor: "#bbf7d0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#15803d",
    marginBottom: 8,
  },
  cardText: {
    color: "#374151",
    fontSize: 14,
    marginVertical: 2,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    color: "#4b5563",
    fontSize: 16,
  },
});
