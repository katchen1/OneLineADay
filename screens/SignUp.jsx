import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { auth, db } from "../firebaseConfig";


export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Creates a user in Firestore Database
  const signUp = async () => {
    try {
      let credential = await createUserWithEmailAndPassword(auth, email, password);
      let uid = credential.user.uid;
      await setDoc(doc(db, "users", uid), {
        // Default data
        email: email,
        entries: [],
        social_mode: false, // Private mode by default
        name: email, // The user's name is their email by default
        friends: [],
      });
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
          className="mt-2 h-16 items-center justify-center rounded-md bg-blue-700"
          onPress={signUp}
        >
          <Text className="items-center justify-center text-xl font-bold text-gray-100">
            Sign up
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
