import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          onPress={() =>
            signInWithEmailAndPassword(auth, email, password).catch((error) =>
              console.error(error)
            )
          }
        >
          <Text className="items-center justify-center text-xl font-bold text-gray-100">
            Sign in
          </Text>
        </Pressable>
        <View className="flex-row items-baseline justify-center">
          <Text className="mt-2 text-lg">Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate("Sign Up")}>
            <Text className="text-lg text-blue-700"> Sign up.</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
