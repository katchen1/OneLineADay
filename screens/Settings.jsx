import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Button,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";

import React, { useState } from "react";

export default function SettingsScreen() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  return (
    <View style={styles.container}>
      <View>
        <Pressable
          className="h-16 flex-row items-center bg-white px-4"
          onPress={() => auth.signOut().catch()}
        >
          <Ionicons name="exit" size={18} />
          <Text className="ml-2 text-lg">Sign out</Text>
        </Pressable>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Notifications</Text>
        <Switch
          value={notificationEnabled}
          onValueChange={(value) => setNotificationEnabled(value)}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Darkmode</Text>
        <Switch
          value={darkModeEnabled}
          onValueChange={(value) => setDarkModeEnabled(value)}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Old password"
          value={oldPassword}
          onChangeText={(value) => setOldPassword(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="New password"
          value={newPassword}
          onChangeText={(value) => setNewPassword(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          value={confirmNewPassword}
          onChangeText={(value) => setConfirmNewPassword(value)}
        />
        <Button
          title="Save new password"
          onPress={() => {
            auth.updatePassword(newPassword).catch();
          }}
        />
      </View>
      <View>
        <Pressable
          className="h-16 flex-row items-center bg-white px-4"
          onPress={() => auth.deleteUser().catch()}
        >
          <Ionicons name="close-circle-outline" size={18} />
          <Text className="ml-2 text-lg">Delete My Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F7F7",
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});
