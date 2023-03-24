import * as Font from "expo-font";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default class SignUpScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { fontsLoaded: false, email: "", password: "" };
  }

  // Creates a user in Firestore Database
  signUp = async () => {
    try {
      let credential = await createUserWithEmailAndPassword(
        auth,
        this.state.email,
        this.state.password
      );
      let uid = credential.user.uid;
      await setDoc(doc(db, "users", uid), {
        // Default data
        email: this.state.email,
        entries: [],
        social_mode: false, // Private mode by default
        name: this.state.email, // The user's name is their email by default
        friends: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  async loadFonts() {
    await Font.loadAsync({
      "Fredoka-Bold": require("../assets/Fredoka-Bold.ttf"),
    });
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this.loadFonts();
  }

  render() {
    // Buffer
    if (!this.state.fontsLoaded) {
      return <Text>Loading...</Text>;
    }

    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full max-w-xs">
          <Text
            style={{
              fontFamily: "Fredoka-Bold",
              fontSize: 50,
              color: "#305DBF",
              alignSelf: "center",
              marginBottom: 20,
            }}
          >
            OneLineADay
          </Text>
          <TextInput
            className="h-16 rounded-md border border-gray-500 py-4 px-8 text-xl"
            placeholder="Email"
            onChangeText={(email) => this.setState({ email: email })}
            style={{ fontFamily: "Raleway_400Regular" }}
          />
          <TextInput
            className="mt-2 h-16 rounded-md border border-gray-500 py-4 px-8 text-xl"
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(password) => this.setState({ password: password })}
            style={{ fontFamily: "Raleway_400Regular" }}
          />
          <Pressable
            className="mt-2 h-16 items-center justify-center rounded-md bg-blue-700"
            style={{ backgroundColor: "#305DBF" }}
            onPress={this.signUp}
          >
            <Text
              className="items-center justify-center text-xl text-gray-100"
              style={{ fontFamily: "Raleway_700Bold" }}
            >
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
