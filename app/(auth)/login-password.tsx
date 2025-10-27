import React, { useState, useContext, useEffect } from "react";
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
import { Ionicons, AntDesign } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthContext } from "../../contexts/AuthContext";
import API_URL from "../../config/apiConfig";

WebBrowser.maybeCompleteAuthSession();

export default function LoginPasswordScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //LOGIN NORMAL (correo + contraseña) 
  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const result = await response.json();
      console.log("Respuesta backend:", result);

      if (response.ok) {
        await login(result.user);
        Alert.alert("Éxito", "Inicio de sesión correcto ✅");
        router.push("/ahorro");
      } else {
        Alert.alert("Error", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login normal:", error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    }
  };

  // === LOGIN CON GOOGLE (SDK 54) ===
  const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: "676601612684-97ojo2u84k2kpsi03rmnfe3s396fb23p.apps.googleusercontent.com",
  androidClientId: "676601612684-97ojo2u84k2kpsi03rmnfe3s396fb23p.apps.googleusercontent.com",
  webClientId: "676601612684-97ojo2u84k2kpsi03rmnfe3s396fb23p.apps.googleusercontent.com",
  redirectUri: `${Constants.expoConfig?.scheme || "giasmobileapp"}:/oauth2redirect/google`,
  scopes: ["profile", "email"],
});

const handleGoogleLogin = async () => {
  await promptAsync();
};

useEffect(() => {
  if (response?.type === "success") {
    const { authentication } = response;
    if (authentication?.accessToken) {
      handleGoogleUser(authentication.accessToken);
    }
  }
}, [response]);

const handleGoogleUser = async (accessToken: string) => {
  try {
    const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = await userInfoResponse.json();
    console.log("👤 Usuario Google:", user);

    const backendResponse = await fetch(`${API_URL}/api/google/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    const result = await backendResponse.json();

    if (backendResponse.status === 200) {
      await login(result.user);
      Alert.alert("Bienvenido", `Inicio de sesión con ${user.name}`);
      router.replace("/ahorro");
    } else if (backendResponse.status === 404) {
      Alert.alert(
        "Usuario no registrado",
        "Tu cuenta de Google no está asociada a un usuario. Regístrate primero.",
        [
          { text: "Ir al registro", onPress: () => router.push("/registro") },
          { text: "Cancelar", style: "cancel" },
        ]
      );
    } else {
      Alert.alert("Error", result.message || "Error al verificar usuario.");
    }
  } catch (error) {
    console.error("Error al obtener datos de Google:", error);
    Alert.alert("Error", "Hubo un problema con Google Login");
  }
};


  return (
    <View style={styles.container}>
      <Header title="" />
      <View style={styles.content}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <TextInput
          placeholder="Ingresa tu correo"
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Ingresa tu contraseña"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request}
          onPress={handleGoogleLogin}
        >
          <AntDesign name="google" size={22} color="#fff" />
          <Text style={styles.googleText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.altButton} onPress={() => router.back()}>
          <Text style={styles.altButtonText}>Ingresar con tu huella</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/send-code")}>
          <Text style={styles.link}>Recupera tu contraseña</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: { width: 120, height: 120, marginBottom: 30, resizeMode: "contain" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "85%",
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "85%",
    marginBottom: 16,
  },
  passwordInput: { flex: 1, padding: 10 },
  eyeIcon: { paddingHorizontal: 10 },
  loginButton: {
    backgroundColor: "#0F2B45",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    width: "85%",
    alignItems: "center",
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DB4437",
    padding: 12,
    borderRadius: 6,
    width: "85%",
    justifyContent: "center",
    marginBottom: 12,
  },
  googleText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  altButton: {
    borderColor: "#0F2B45",
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    width: "85%",
    alignItems: "center",
  },
  altButtonText: { color: "#0F2B45", fontSize: 16, fontWeight: "bold" },
  link: { color: "blue", textDecorationLine: "underline" },
});
