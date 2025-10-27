import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../../config/apiConfig";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RegistroScreen() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [lada, setLada] = useState("+52");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [colonia, setColonia] = useState("");
  const [estados, setEstados] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [colonias, setColonias] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);

  // === Validaciones en backend ===
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null);

  // === Cargar Estados al iniciar ===
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch(`${API_URL}/api/estados`);
        const data = await res.json();
        setEstados(data.estados || []);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "No se pudieron cargar los estados");
      }
    };
    fetchEstados();
  }, []);

  // === Cambiar estado → cargar municipios ===
  const handleEstadoChange = async (value: string) => {
    setEstado(value);
    setMunicipio("");
    setColonia("");
    try {
      const res = await fetch(
        `${API_URL}/api/cupomex/municipios?estado=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setMunicipios(data.municipios || []);
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar los municipios");
    }
  };

  // === Cambiar municipio → cargar colonias ===
  const handleMunicipioChange = async (value: string) => {
    setMunicipio(value);
    setColonia("");
    try {
      const res = await fetch(
        `${API_URL}/api/cupomex/colonias?municipio=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setColonias(data.colonias || []);
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar las colonias");
    }
  };

  // === Validar correo con API ===
  const validateEmail = async () => {
    try {
      const res = await fetch(`${API_URL}/api/validate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo }),
      });
      const result = await res.json();
      setIsEmailValid(result.valid);
      if (!result.valid) Alert.alert("Error", result.message || "Correo inválido");
    } catch (err) {
      setIsEmailValid(false);
      Alert.alert("Error", "Error al validar correo");
    }
  };

  // === Validar teléfono con API ===
  const validatePhone = async () => {
    const fullPhone = `${lada}${telefono}`;
    try {
      const res = await fetch(`${API_URL}/api/validate-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const result = await res.json();
      setIsPhoneValid(result.valid);
      if (!result.valid)
        Alert.alert("Error", result.message || "Número de teléfono inválido");
    } catch (err) {
      setIsPhoneValid(false);
      Alert.alert("Error", "Error al validar teléfono");
    }
  };

  // === Evaluar fortaleza de contraseña ===
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
    else if (strength === 3) setPasswordStrength("Medio");
    else setPasswordStrength("Fuerte");
  };

// === Submit registro ===
const handleRegistro = async () => {
  if (!nombre || !apellidos || !correo || !contrasena || !telefono) {
    Alert.alert("Error", "Todos los campos son obligatorios");
    return;
  }
  if (!isEmailValid) {
    Alert.alert("Error", "Correo inválido");
    return;
  }
  if (!isPhoneValid) {
    Alert.alert("Error", "Teléfono inválido");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellidos,
        correo,
        password: contrasena,
        telefono: `${lada}${telefono}`,
        estado,
        municipio,
        colonia,
      }),
    });

    if (res.ok) {
      Alert.alert(
        "Registro exitoso ✅",
        "Hemos enviado un correo de verificación. Por favor revisa tu bandeja antes de iniciar sesión."
      );

      // limpiar formulario
      setNombre("");
      setApellidos("");
      setCorreo("");
      setContrasena("");
      setTelefono("");
      setEstado("");
      setMunicipio("");
      setColonia("");
    } else {
      const errorData = await res.json();
      Alert.alert("Error", errorData.message || "No se pudo registrar el usuario");
    }
  } catch (err) {
    Alert.alert("Error", "Fallo de red al registrar");
  }
};


  return (
    <View style={styles.container}>
      <Header title="" />
      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          placeholder="Apellidos"
          style={styles.input}
          value={apellidos}
          onChangeText={setApellidos}
        />
        <TextInput
          placeholder="Correo"
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          onBlur={validateEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Contraseña con ojito */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Contraseña"
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={contrasena}
            onChangeText={(val) => {
              setContrasena(val);
              checkPasswordStrength(val);
            }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>

        {passwordStrength ? (
          <Text
            style={{
              color:
                passwordStrength === "Fuerte"
                  ? "green"
                  : passwordStrength === "Medio"
                  ? "orange"
                  : "red",
              marginBottom: 8,
            }}
          >
            Fortaleza: {passwordStrength}
          </Text>
        ) : null}
        {passwordSuggestions.map((s, i) => (
          <Text key={i} style={{ fontSize: 12, color: "red" }}>
            • {s}
          </Text>
        ))}

        {/* Teléfono con lada */}
        <View style={styles.phoneRow}>
          <Picker
            selectedValue={lada}
            style={styles.ladaPicker}
            onValueChange={(val) => setLada(val)}
          >
            <Picker.Item label="🇲🇽 +52 (México)" value="+52" />
            <Picker.Item label="🇺🇸 +1 (EE.UU.)" value="+1" />
            <Picker.Item label="🇨🇦 +1 (Canadá)" value="+1" />
          </Picker>
          <TextInput
            placeholder="Número Telefónico"
            style={[styles.input, { flex: 1 }]}
            value={telefono}
            onChangeText={setTelefono}
            onBlur={validatePhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Estado, municipio, colonia */}
        <Picker
          selectedValue={estado}
          onValueChange={handleEstadoChange}
          style={styles.input}
        >
          <Picker.Item label="Selecciona un estado" value="" />
          {estados.map((e, i) => (
            <Picker.Item key={i} label={e} value={e} />
          ))}
        </Picker>

        <Picker
          selectedValue={municipio}
          onValueChange={handleMunicipioChange}
          enabled={!!estado}
          style={styles.input}
        >
          <Picker.Item label="Selecciona un municipio" value="" />
          {municipios.map((m, i) => (
            <Picker.Item key={i} label={m} value={m} />
          ))}
        </Picker>

        <Picker
          selectedValue={colonia}
          onValueChange={setColonia}
          enabled={!!municipio}
          style={styles.input}
        >
          <Picker.Item label="Selecciona una colonia" value="" />
          {colonias.map((c, i) => (
            <Picker.Item key={i} label={c} value={c} />
          ))}
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleRegistro}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  form: { padding: 20 },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#0F2B45",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    paddingRight: 10,
    marginBottom: 12,
  },
  phoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ladaPicker: {
    width: 150,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginRight: 8,
  },
});
