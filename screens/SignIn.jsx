import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SignInScreen({ navigation }) {
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
            signInWithEmailAndPassword(auth, email, password).catch((error) =>
              console.error(error)
            )
          }
          style={styles.signInButton}
        >
          <Text style={styles.signInButtonText}>Sign in</Text>
        </Pressable>
        <View style={styles.noAccountContainer}>
          <Text style={styles.noAccountText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate("Sign Up")}>
            <Text style={styles.signUpButton}> Sign up.</Text>
          </Pressable>
        </View>
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
    maxWidth: 350,
    width: "100%",
  },
  input: {
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 16,
    height: 64,
    padding: 16,
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
  noAccountContainer: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "center",
  },
  noAccountText: {
    fontSize: 18,
    marginTop: 8,
  },
  signUpButton: {
    color: "#0000FF",
    fontSize: 18,
  },
});
