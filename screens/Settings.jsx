import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SettingsScreen({ navigation }) {
  return (
    <View>
      <Pressable
        className="h-16 flex-row items-center bg-white px-4"
        onPress={() => navigation.navigate("Notifications")}
      >
        <Ionicons name="notifications" size={18} />
        <Text className="ml-2 text-lg">Notifications</Text>
      </Pressable>
      <Pressable
        className="h-16 flex-row items-center bg-white px-4"
        onPress={() => auth.signOut().catch()}
      >
        <Ionicons name="exit" size={18} />
        <Text className="ml-2 text-lg">Sign out</Text>
      </Pressable>
    </View>
  );
}
