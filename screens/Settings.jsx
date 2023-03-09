import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import colors from "tailwindcss/colors";
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
        onPress={() => navigation.navigate("Change Password")}
      >
        <Ionicons name="lock-closed" size={18} />
        <Text className="ml-2 text-lg">Change password</Text>
      </Pressable>
      <Pressable
        className="h-16 flex-row items-center bg-white px-4"
        onPress={() => auth.signOut().catch()}
      >
        <Ionicons name="exit" size={18} />
        <Text className="ml-2 text-lg">Sign out</Text>
      </Pressable>
      <Pressable
        className="h-16 flex-row items-center bg-white px-4"
        onPress={() => navigation.navigate("Delete Account")}
      >
        <Ionicons name="trash" size={18} color={colors.red[700]} />
        <Text className="ml-2 text-lg text-red-700">Delete account</Text>
      </Pressable>
    </View>
  );
}
