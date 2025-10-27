import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API_URL from "../../config/apiConfig";

export default function SendCodeScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reset-mobile/enviar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }), // 👈 nombre correcto del campo
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Código enviado", "Revisa tu bandeja de entrada 📩");
        router.push({
          pathname: "/verify-code",
          params: { email },
        });
      } else {
        Alert.alert("Error", result.message || "No se pudo enviar el código");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un problema al enviar el código");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="" />
      <View style={styles.content}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu correo para enviar un código</Text>

        <TextInput
          placeholder="ejemplo@correo.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleSendCode}>
          <Text style={styles.buttonText}>Enviar código</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0F2B45", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#444", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "90%",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0F2B45",
    padding: 12,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { color: "#0F2B45", marginTop: 12, textDecorationLine: "underline" },
});
