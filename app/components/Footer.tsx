import { View, Text, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#0F2B45",
    paddingVertical: 0,
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 12,
  },
});
