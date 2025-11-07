// app/validaciones-tanda.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import API_URL from "../../config/apiConfig";
import { AuthContext } from "../../contexts/AuthContext";

export default function ValidacionesTandaScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { monto, tipo } = useLocalSearchParams<{ monto?: string; tipo?: string }>();

  // Estado UI / datos
  const [credencial, setCredencial] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [facebook, setFacebook] = useState("");
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // Helpers
  // =========================
  const esFacebookPerfil = (link: string) => {
    const regex =
      /^https:\/\/(www\.)?facebook\.com\/(?!pages|groups|events|marketplace)[A-Za-z0-9.\-]+\/?$/i;
    return regex.test(link.trim());
  };

  const showServerError = async (res: Response) => {
    let msg = "Error en el servidor";
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch (_) {
      // ignore parse error
    }
    Alert.alert("Error", msg);
  };

  // =========================
  // Efecto: verificar si ya tiene validaciones guardadas
  // =========================
  useEffect(() => {
    const verificarAhorro = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`${API_URL}/api/ahorros-usuarios/${user._id}`);
        if (res.ok) {
          setYaRegistrado(true); // ya tiene credencial/selfie registradas
        } else {
          setYaRegistrado(false);
        }
      } catch (error) {
        console.log("Error verificando ahorro previo:", error);
        setYaRegistrado(false);
      }
    };
    verificarAhorro();
  }, [user]);

  // =========================
  // Captura de imágenes
  // =========================
  // Credencial: galería o cámara
  const seleccionarImagen = async (setter: (uri: string) => void) => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      return Alert.alert("Permiso requerido", "Debes permitir el acceso a la galería.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const tomarFoto = async (setter: (uri: string) => void) => {
    const permiso = await Camera.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      return Alert.alert("Permiso requerido", "Debes permitir el uso de la cámara.");
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: false,
      exif: true,               
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  // =========================
  // Acciones principales
  // =========================
  const handleSubmit = async () => {
    if (!user?._id) {
      return Alert.alert("Error", "No se encontró el usuario logueado.");
    }
    if (!monto || !tipo) {
      return Alert.alert("Error", "Faltan datos de la tanda (monto/tipo).");
    }

    // Confirmación de unión a la tanda
    const textoConfirm = yaRegistrado
      ? "⚠ Ya formas parte de una tanda activa. ¿Deseas unirte a otra y adquirir un nuevo compromiso de pago?"
      : `Estás a punto de unirte a la tanda de $${monto} (${tipo}). ¿Deseas continuar?`;

    Alert.alert("Confirmar unión", textoConfirm, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, continuar",
        onPress: async () => {
          if (yaRegistrado) {
            await registrarEnTanda();
          } else {
            // Validaciones locales
            if (!credencial) return Alert.alert("Falta credencial", "Sube o toma foto de tu credencial.");
            if (!selfie) return Alert.alert("Falta selfie", "Tómate una selfie con cabello recogido.");
            if (!facebook) return Alert.alert("Falta enlace", "Ingresa el enlace a tu perfil de Facebook.");
            if (!esFacebookPerfil(facebook)) {
              return Alert.alert(
                "Enlace inválido",
                "Ingresa un enlace válido, por ejemplo: https://facebook.com/tu.usuario"
              );
            }
            await registrarNuevoUsuario();
          }
        },
      },
    ]);
  };

  // 1) Guardar credencial/selfie/facebook en /api/ahorros-usuarios
  const registrarNuevoUsuario = async () => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("userId", user!._id);
      fd.append("monto", String(monto));
      fd.append("tipo", String(tipo));
      fd.append("facebook", facebook);
      fd.append("numeros", "1");

      const credName = credencial!.split("/").pop() || "credencial.jpg";
      const selfieName = selfie!.split("/").pop() || "selfie.jpg";

      fd.append("credencial", {
        uri: credencial!,
        name: credName,
        type: "image/jpeg",
      } as any);

      fd.append("fotoPersona", {
        uri: selfie!,
        name: selfieName,
        type: "image/jpeg",
      } as any);

      const res = await fetch(`${API_URL}/api/ahorros-usuarios`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        await showServerError(res);
        return;
      }
      // Si guardó correctamente, procede a unirse a la tanda
      await registrarEnTanda();
    } catch (error) {
      console.error("❌ Error al registrar nuevo usuario:", error);
      Alert.alert(
        "Error",
        "Ocurrió un problema al guardar tus validaciones. Verifica tu credencial, tu nombre y el enlace de Facebook."
      );
    } finally {
      setLoading(false);
    }
  };

  // 2) Unirse/crear tanda en /api/tandas
  const registrarEnTanda = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tandas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!._id,
          monto, // backend acepta string o número
          tipo,
          numeros: 1,
        }),
      });

      if (!res.ok) {
        await showServerError(res);
        return;
      }

      Alert.alert("🎉 Listo", "Te has unido correctamente a la tanda.");
      router.push("/ahorro");
    } catch (error) {
      console.error("❌ Error al registrar en tanda:", error);
      Alert.alert("Error", "No se pudo registrar en la tanda. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header title="" />

        <View style={styles.subHeader}>
          <Text style={styles.title}>
            {yaRegistrado
              ? "Confirmar participación en nueva tanda"
              : "Requisitos adicionales para ingresar al ahorro"}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {!yaRegistrado && (
              <>
                {/* Credencial */}
                <Text style={styles.label}>Foto de tu credencial de elector (INE)</Text>
                {credencial && <Image source={{ uri: credencial }} style={styles.previewImage} />}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => seleccionarImagen(setCredencial)}
                  >
                    <Text style={styles.inputText}>Elegir archivo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => tomarFoto(setCredencial)}
                  >
                    <Text style={styles.inputText}>Tomar foto</Text>
                  </TouchableOpacity>
                </View>

                {/* Selfie (solo cámara) */}
                <Text style={styles.label}>Tómate una selfie con cabello recogido</Text>
                {selfie && <Image source={{ uri: selfie }} style={styles.previewImage} />}
                <TouchableOpacity
                  style={[styles.inputButton, { width: "100%" }]}
                  onPress={() => tomarFoto(setSelfie)}
                >
                  <Text style={styles.inputText}>Tomar selfie</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <Text style={styles.label}>Enlace de tu perfil de Facebook</Text>
                <TextInput
                  placeholder="https://facebook.com/usuario"
                  value={facebook}
                  onChangeText={setFacebook}
                  style={styles.textInput}
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            {/* Botones */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleSubmit}>
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modal de carga: fondo oscuro con opacidad */}
        <Modal visible={loading} transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>
                Procesando tu información, por favor espera...
              </Text>
            </View>
          </View>
        </Modal>

        <Footer />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  subHeader: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#0F2B45", textAlign: "center" },
  scrollContent: { padding: 16, paddingBottom: 120 },
  formContainer: { backgroundColor: "#EDEDED", borderRadius: 12, padding: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#000", marginBottom: 8 },

  inputButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  inputText: { fontSize: 14, fontWeight: "600", color: "#444" },

  textInput: {
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    marginBottom: 20,
  },

  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  confirmButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Modal de carga (oscuro con opacidad)
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
});
