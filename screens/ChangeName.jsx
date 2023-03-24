import { doc, getDoc, setDoc } from "firebase/firestore";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-root-toast";
import { auth, db } from "../firebaseConfig";

export default class ChangeNameScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { oldName: "", newName: "", isLoading: true };
  }

  updateName = () => {
    this.setState({ oldName: this.state.newName }); // Update UI
    setDoc(this.userRef, { name: this.state.newName }, { merge: true }); // Firestore update
    Toast.show("Name updated"); // Show confirmation message
    this.navigation.goBack();
  };

  async componentDidMount() {
    this.userRef = doc(db, "users", auth.currentUser.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      this.setState({ oldName: docSnap.data().name, isLoading: false });
    }
  }

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>;
    }

    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full max-w-xs">
          <Text
            style={{
              fontSize: 16,
              color: "gray",
              fontFamily: "Raleway_300Light",
            }}
          >
            Current name
          </Text>
          <Text style={{ fontSize: 24, fontFamily: "Raleway_500Medium" }}>
            {this.state.oldName}
          </Text>
          <TextInput
            className="mt-2 h-16 rounded-md border border-gray-500 p-4 text-base"
            placeholder="New name"
            onChangeText={(newName) => this.setState({ newName: newName })}
            style={{ fontFamily: "Raleway_400Regular" }}
          />
          <Pressable
            className="mt-2 h-16 items-center justify-center rounded-md bg-blue-700"
            style={{ backgroundColor: "#305DBF" }}
            onPress={this.updateName}
          >
            <Text
              className="items-center justify-center text-xl text-gray-100"
              style={{ fontFamily: "Raleway_700Bold" }}
            >
              Update name
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
