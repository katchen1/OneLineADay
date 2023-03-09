import { deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function DeleteAccountScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function deleteAccount() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await Promise.all(
        deleteUser(auth.currentUser),
        deleteDoc(doc(db, "users", auth.currentUser.uid))
      );
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
        />
        <TextInput
          className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        <Pressable
          className="mt-2 h-16 items-center justify-center rounded-md bg-red-700"
          onPress={deleteAccount}
        >
          <Text className="items-center justify-center text-xl font-bold text-gray-100">
            Delete account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
