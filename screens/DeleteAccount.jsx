import { deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import { auth, db } from "../firebaseConfig";

export default function DeleteAccountScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function deleteAccount() {
    if (auth.currentUser.email.toLowerCase() !== email.toLowerCase()) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await Promise.all(
        deleteUser(auth.currentUser),
        deleteDoc(doc(db, "users", auth.currentUser.uid))
      );
      Toast.show("Account deleted");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="w-full max-w-xs">
        <TextInput
          className="h-16 rounded-md border border-gray-500 p-4 text-base"
          placeholder="Email"
          onChangeText={setEmail}
          style={{ fontFamily: "Raleway_400Regular" }}
        />
        <TextInput
          className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={setPassword}
          style={{ fontFamily: "Raleway_400Regular" }}
        />
        <Pressable
          className="mt-2 h-16 items-center justify-center rounded-md bg-red-700"
          onPress={deleteAccount}
        >
          <Text
            className="items-center justify-center text-xl text-gray-100"
            style={{ fontFamily: "Raleway_700Bold" }}
          >
            Delete account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
