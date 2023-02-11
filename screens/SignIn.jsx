import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={setPassword}
          style={[styles.input, { marginTop: 8 }]}
        />
        <Pressable
          onPress={() =>
            signInWithEmailAndPassword(auth, email, password).catch(() => {})
          }
          style={styles.signInButton}
        >
          <Text style={styles.signInButtonText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
  },
  subcontainer: {
    maxWidth: 300,
    width: "100%",
  },
  input: {
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 16,
    height: 64,
    maxWidth: 300,
    padding: 16,
    width: "100%",
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 8,
    height: 64,
    justifyContent: "center",
    marginTop: 8,
  },
  signInButtonText: {
    alignItems: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    justifyContent: "center",
  },
});
