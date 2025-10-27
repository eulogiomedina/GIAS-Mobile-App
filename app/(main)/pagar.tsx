import { View, Text, StyleSheet } from "react-native";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PagarScreen() {
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* HEADER */}
        <Header title="" />

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.content}>
          <Text style={styles.text}>Pantalla de Pagar</Text>
        </View>

        {/* FOOTER */}
        <Footer />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});
