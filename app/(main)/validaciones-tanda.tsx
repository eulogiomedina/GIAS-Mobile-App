import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import API_URL from "../../config/apiConfig";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext"; // asegúrate que tu contexto de usuario esté así

export default function ValidacionesTandaScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const { monto, tipo } = useLocalSearchParams(); // valores recibidos desde la pantalla anterior

  const [credencial, setCredencial] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [facebook, setFacebook] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Valida si el enlace de Facebook es correcto
  const esFacebookPerfil = (link: string) => {
    const regex = /^https:\/\/(www\.)?facebook\.com\/(?!pages|groups|events|marketplace)[A-Za-z0-9.\-]+\/?$/i;
    return regex.test(link);
  };

  // ✅ Seleccionar desde galería
  const seleccionarImagen = async (setter: (uri: string) => void) => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      return Alert.alert("Permiso requerido", "Debes permitir el acceso a la galería.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  // ✅ Tomar foto con cámara
  const tomarFoto = async (setter: (uri: string) => void) => {
    const permiso = await Camera.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      return Alert.alert("Permiso requerido", "Debes permitir el uso de la cámara.");
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  // ✅ Enviar datos al backend
  const handleSubmit = async () => {
    if (!user?._id) {
      return Alert.alert("Error", "No se encontró el usuario logueado.");
    }

    if (!credencial || !selfie) {
      return Alert.alert("Campos incompletos", "Sube las fotos requeridas.");
    }

    if (!facebook) {
      return Alert.alert("Campo vacío", "Debes ingresar tu enlace de Facebook.");
    }

    if (!esFacebookPerfil(facebook)) {
      return Alert.alert(
        "Enlace inválido",
        "Por favor ingresa un enlace válido, ej: https://facebook.com/tu.usuario"
      );
    }

    try {
      setLoading(true);

      // 🔹 Paso 1: Registrar el ahorro del usuario
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("monto", String(monto));
      formData.append("tipo", String(tipo));
      formData.append("facebook", facebook);
      formData.append("numeros", "1");

      // 🔹 Convertir URIs a archivos válidos
      const credencialFilename = credencial.split("/").pop()!;
      const selfieFilename = selfie.split("/").pop()!;

      formData.append("credencial", {
        uri: credencial,
        name: credencialFilename,
        type: "image/jpeg",
      } as any);

      formData.append("fotoPersona", {
        uri: selfie,
        name: selfieFilename,
        type: "image/jpeg",
      } as any);

      const res = await fetch(`${API_URL}/api/ahorros-usuarios`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al guardar ahorro");

      // 🔹 Paso 2: Registrar en la tanda
      const tandaRes = await fetch(`${API_URL}/api/tandas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          monto,
          tipo,
          numeros: 1,
        }),
      });

      const tandaData = await tandaRes.json();
      if (!tandaRes.ok) throw new Error(tandaData.message || "Error al registrar tanda");

      Alert.alert("Éxito 🎉", "Tu ahorro ha sido registrado correctamente.");
      router.push(`/detalle-tanda/${tandaData._id}`);

    } catch (error: any) {
      console.error("❌ Error al guardar el ahorro:", error);
      Alert.alert("Error", error.message || "Hubo un problema al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header title="" />

        <View style={styles.subHeader}>
          <Text style={styles.title}>
            Requisitos adicionales para ingresar al ahorro
          </Text>
          <Text style={styles.subText}>
            Estás a punto de unirte a una tanda de ${monto} {tipo}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {/* 📄 INE */}
            <Text style={styles.label}>Foto de tu credencial de elector (INE)</Text>
            {credencial && <Image source={{ uri: credencial }} style={styles.previewImage} />}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.inputButton} onPress={() => seleccionarImagen(setCredencial)}>
                <Text style={styles.inputText}>Elegir archivo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton} onPress={() => tomarFoto(setCredencial)}>
                <Text style={styles.inputText}>Tomar foto</Text>
              </TouchableOpacity>
            </View>

            {/* 🤳 Selfie */}
            <Text style={styles.label}>Tómate una selfie con cabello recogido</Text>
            {selfie && <Image source={{ uri: selfie }} style={styles.previewImage} />}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.inputButton} onPress={() => seleccionarImagen(setSelfie)}>
                <Text style={styles.inputText}>Elegir archivo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton} onPress={() => tomarFoto(setSelfie)}>
                <Text style={styles.inputText}>Tomar selfie</Text>
              </TouchableOpacity>
            </View>

            {/* 🔗 Facebook */}
            <Text style={styles.label}>Enlace de tu perfil de Facebook</Text>
            <TextInput
              placeholder="https://facebook.com/usuario"
              value={facebook}
              onChangeText={setFacebook}
              style={styles.textInput}
              placeholderTextColor="#666"
            />

            {/* ✅ Botones */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleSubmit}>
                <Text style={styles.confirmText}>
                  {loading ? "Enviando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
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
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#0F2B45", textAlign: "center" },
  subText: { color: "#0F2B45", fontSize: 14, marginTop: 4 },
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
});
