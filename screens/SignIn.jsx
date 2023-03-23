import * as Font from "expo-font";
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { auth } from "../firebaseConfig";

export default class SignInScreen extends React.Component  {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = {fontsLoaded: false, email: "", password: ""};
  }

  async loadFonts() {
    await Font.loadAsync({
      'Fredoka-Bold': require('../assets/Fredoka-Bold.ttf'),
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
          <Text style={{ fontFamily: 'Fredoka-Bold', fontSize: 50, color: "#305DBF", alignSelf: "center", marginBottom: 20 }}>OneLineADay</Text>
          <TextInput
            className="h-16 rounded-md border border-gray-500 p-4 text-base"
            placeholder="Email"
            onChangeText={(newEmail) => this.setState({email: newEmail})}
          />
          <TextInput
            className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(newPassword) => this.setState({password: newPassword})}
          />
          <Pressable
            className="mt-2 h-16 items-center justify-center rounded-md bg-blue-700" style={{backgroundColor: "#305DBF"}}
            onPress={() =>
              signInWithEmailAndPassword(auth, this.state.email, this.state.password).catch((error) =>
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
            <Pressable onPress={() => this.navigation.navigate("Sign Up")}>
              <Text className="text-lg text-blue-700" style={{color: "#305DBF"}}> Sign up.</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
}
