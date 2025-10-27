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
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API_URL from "../../config/apiConfig";

export default function VerifyCodeScreen() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Por favor ingresa el código recibido.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reset-mobile/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, codigo: code }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Código correcto ✅", "Ahora crea tu nueva contraseña.");
        router.push({
          pathname: "/change-password",
          params: { email, code },
        });
      } else {
        Alert.alert("Error", result.message || "Código incorrecto o expirado");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un problema al verificar el código");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="" />
      <View style={styles.content}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Verificar código</Text>
        <Text style={styles.subtitle}>Revisa tu correo y escribe el código</Text>

        <TextInput
          placeholder="Código de 6 dígitos"
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verificar</Text>
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
});
