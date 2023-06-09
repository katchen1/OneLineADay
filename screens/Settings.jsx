import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-root-toast";
import { auth } from "../firebaseConfig";

export default function SettingsScreen({ navigation }) {
  const styles = StyleSheet.create({
    container: {
      //backgroundColor: "gray",
    },
    item: {
      height: 80,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 5,
      marginHorizontal: 8,
      marginTop: 10,
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
      color: "#be3333",
    },
    text: {
      fontSize: 20,
      color: "#263238",
      paddingLeft: 8,
      flex: 8,
      fontFamily: "Raleway_400Regular",
    },
    delete_account_text: {
      fontSize: 20,
      color: "#263238",
      paddingLeft: 8,
      fontFamily: "Raleway_400Regular",
    },
  });

  return (
    <View style={styles.container}>
      <Pressable
        //style={styles.item}
        style={({ pressed }) => [
          { backgroundColor: pressed ? "#EEEEEE" : "white" },
          styles.item,
        ]}
        onPress={() => navigation.navigate("Notifications")}
      >
        <Ionicons name="notifications" size={32} style={styles.icons} />
        <Text style={styles.text}>Notification</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "#EEEEEE" : "white" },
          styles.item,
        ]}
        onPress={() => navigation.navigate("Change Name")}
      >
        <Ionicons name="person-circle" size={32} style={styles.icons} />
        <Text style={styles.text}>Change name</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "#EEEEEE" : "white" },
          styles.item,
        ]}
        onPress={() => navigation.navigate("Change Password")}
      >
        <Ionicons name="lock-closed" size={32} style={styles.icons} />
        <Text style={styles.text}>Change password</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "#EEEEEE" : "white" },
          styles.item,
        ]}
        onPress={() => {
          Alert.alert("Sign Out", "Are you sure?", [
            { text: "Cancel" },
            {
              text: "OK",
              onPress: () => {
                Toast.show("Signed out");
                auth.signOut().catch();
              },
            },
          ]);
        }}
      >
        <Ionicons name="exit" size={36} style={styles.signout_icon} />
        <Text style={styles.text}>Sign out</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "#EEEEEE" : "white" },
          styles.item,
        ]}
        onPress={() => navigation.navigate("Delete Account")}
      >
        <Ionicons name="trash" size={32} style={styles.delete_icon} />
        <Text style={styles.delete_account_text}>Delete account</Text>
      </Pressable>
    </View>
  );
}
