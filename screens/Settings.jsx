import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SettingsScreen({ navigation }) {
  const styles = StyleSheet.create({
    container: {
      //backgroundColor: "gray",
    },
    item: {
      backgroundColor: "white",
      height: 80,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 5,
      marginHorizontal: 8,
      marginVertical: 16,
      borderRadius: 10,
    },
    icons: {
      paddingLeft: 5,
      color: "#305DBF",
      flex: 1,
    },
    signout_icon: {
      paddingLeft: 7,
      color: "#305DBF",
    },
    delete_icon: {
      paddingLeft: 7,
      color: "BE3333",
    },
    text: {
      fontSize: 22,
      corlor: "#263238",
      paddingLeft: 8,
      flex: 8,
    },
    delete_account_text: {
      fontSize: 22,
      corlor: "#263238",
      paddingLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("Notifications")}
      >
        <Ionicons name="notifications" size={36} style={styles.icons} />
        <Text style={styles.text}>Notification</Text>
      </Pressable>
      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("Change Password")}
      >
        <Ionicons name="lock-closed" size={36} style={styles.icons} />
        <Text style={styles.text}>Change password</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => auth.signOut().catch()}>
        <Ionicons name="exit" size={40} style={styles.signout_icon} />
        <Text style={styles.text}>Sign out</Text>
      </Pressable>
      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate("Delete Account")}
      >
        <Ionicons name="trash" size={36} style={styles.delete_icon} />
        <Text style={styles.delete_account_text}>Delete account</Text>
      </Pressable>
    </View>
  );
}
