import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LoginScreen() {
  const router = useRouter();

  const handleFingerprintAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return Alert.alert("Error", "Este dispositivo no tiene lector de huella.");
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return Alert.alert("Error", "No hay huellas registradas en este dispositivo.");
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Inicia sesión con tu huella",
        fallbackLabel: "Usar PIN",
      });

      if (result.success) {
        Alert.alert("Bienvenido", "Autenticación exitosa 🎉");
        router.push("/ahorro"); // ✅ Redirige a la pantalla principal
      } else {
        Alert.alert("Error", "Huella incorrecta o cancelada.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un problema con la autenticación biométrica.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="" />

      <View style={styles.content}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />

        <Text style={styles.title}>¡Buenos días!</Text>
        <Text style={styles.subtitle}>Usuario</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login-password")} // ✅ Navega correctamente al login con contraseña
        >
          <Text style={styles.buttonText}>Ingresar con contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFingerprintAuth}>
          <Image
            source={require("../assets/images/huella.png")}
            style={styles.fingerprint}
          />
        </TouchableOpacity>
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120, marginBottom: 60, resizeMode: "contain" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  button: {
    borderWidth: 1,
    borderColor: "#0F2B45",
    padding: 12,
    width: "90%",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: { color: "#0F2B45", fontSize: 16, fontWeight: "bold" },
  fingerprint: { width: 100, height: 100, resizeMode: "contain", marginTop: 30 },
});
