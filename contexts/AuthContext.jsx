import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔹 Cargar usuario al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          // 🔧 Asegurar compatibilidad entre id y _id
          const normalizedUser = {
            ...parsed,
            _id: parsed._id || parsed.id,
            id: parsed.id || parsed._id,
          };
          setUser(normalizedUser);
        }
      } catch (error) {
        console.error("Error al cargar usuario desde AsyncStorage:", error);
      }
    };
    loadUser();
  }, []);

  // 🔹 Guardar usuario en sesión
  const login = async (userData) => {
    try {
      // 🔧 Unificar campos id / _id antes de guardar
      const normalizedUser = {
        ...userData,
        _id: userData._id || userData.id,
        id: userData.id || userData._id,
      };
      setUser(normalizedUser);
      await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  // 🔹 Cerrar sesión
  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
