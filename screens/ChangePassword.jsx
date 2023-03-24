import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import { auth } from "../firebaseConfig";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  async function updateUserPassword() {
    if (newPassword1 !== newPassword2) return;

    try {
      await signInWithEmailAndPassword(
        auth,
        auth.currentUser.email,
        currentPassword
      );
      await updatePassword(auth.currentUser, newPassword1);
      Toast.show("Password updated");
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="w-full max-w-xs">
        <TextInput
          className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
          placeholder="Current password"
          secureTextEntry={true}
          onChangeText={setCurrentPassword}
          style={{ fontFamily: "Raleway_400Regular" }}
        />
        <TextInput
          className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
          placeholder="New password"
          secureTextEntry={true}
          onChangeText={setNewPassword1}
          style={{ fontFamily: "Raleway_400Regular" }}
        />
        <TextInput
          className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
          placeholder="Re-enter new password"
          secureTextEntry={true}
          onChangeText={setNewPassword2}
          style={{ fontFamily: "Raleway_400Regular" }}
        />
        <Pressable
          className="mt-2 h-16 items-center justify-center rounded-md bg-blue-700"
          style={{ backgroundColor: "#305DBF" }}
          onPress={updateUserPassword}
        >
          <Text
            className="items-center justify-center text-xl text-gray-100"
            style={{ fontFamily: "Raleway_700Bold" }}
          >
            Update password
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
