import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SettingsScreen() {
  return (
    <View>
      <Pressable onPress={() => auth.signOut().catch()} style={styles.setting}>
        <Ionicons name="exit" size={18} />
        <Text style={styles.settingText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  setting: {
    alignItems: "center",
    backgroundColor: "#fff",
    flexDirection: "row",
    height: 64,
    paddingHorizontal: 16,
  },
  settingText: {
    fontSize: 18,
    marginLeft: 8,
  },
});
