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
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API_URL from "../../config/apiConfig";

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const { email, code } = useLocalSearchParams();

  // === Evaluar fortaleza de la nueva contraseña ===
  const commonPatterns = ["123", "123456", "qwerty", "password", "abc123"];
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    const suggestions: string[] = [];

    if (pwd.length >= 8) strength++;
    else suggestions.push("Debe tener al menos 8 caracteres");

    if (/[A-Z]/.test(pwd)) strength++;
    else suggestions.push("Debe incluir una mayúscula");

    if (/[a-z]/.test(pwd)) strength++;
    else suggestions.push("Debe incluir una minúscula");

    if (/[0-9]/.test(pwd)) strength++;
    else suggestions.push("Debe incluir un número");

    if (/[\W]/.test(pwd)) strength++;
    else suggestions.push("Debe incluir un carácter especial");

    if (commonPatterns.some((p) => pwd.toLowerCase().includes(p))) {
      strength = 1;
      suggestions.push("No debe contener patrones comunes");
    }

    setPasswordSuggestions(suggestions);
    if (strength <= 2) setPasswordStrength("Débil");
    else if (strength === 3) setPasswordStrength("Media");
    else setPasswordStrength("Fuerte");
  };

  // === Cambiar contraseña ===
  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirm.trim()) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reset-mobile/cambiar-contrasena`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: email,
          codigo: code,
          nuevaContrasena: newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Éxito 🎉", "Tu contraseña se ha actualizado correctamente.");
        router.replace("/login");
      } else {
        Alert.alert("Error", result.message || "No se pudo actualizar la contraseña");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un problema al cambiar la contraseña");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="" />
      <View style={styles.content}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>Crea tu nueva contraseña segura</Text>

        {/* Contraseña nueva */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Nueva contraseña"
            secureTextEntry={!showNewPassword}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              checkPasswordStrength(val);
            }}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>

        {/* Indicador de fortaleza */}
        {passwordStrength ? (
          <Text
            style={{
              color:
                passwordStrength === "Fuerte"
                  ? "green"
                  : passwordStrength === "Media"
                  ? "orange"
                  : "red",
              marginBottom: 8,
              fontWeight: "bold",
            }}
          >
            Fortaleza: {passwordStrength}
          </Text>
        ) : null}

        {/* Sugerencias */}
        {passwordSuggestions.map((s, i) => (
          <Text key={i} style={{ fontSize: 12, color: "red" }}>
            • {s}
          </Text>
        ))}

        {/* Confirmar contraseña */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirmar contraseña"
            secureTextEntry={!showConfirmPassword}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Guardar</Text>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    paddingRight: 10,
    width: "90%",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0F2B45",
    padding: 12,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
