import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SignUpScreen({ navigation }) {
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
          onPress={() => {
            createUserWithEmailAndPassword(auth, email, password).catch(
              (error) => console.error(error)
            );
          }}
          style={styles.signUpButton}
        >
          <Text style={styles.signUpButtonText}>Sign up</Text>
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
  signUpButton: {
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 8,
    height: 64,
    justifyContent: "center",
    marginTop: 8,
  },
  signUpButtonText: {
    alignItems: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    justifyContent: "center",
  },
});
