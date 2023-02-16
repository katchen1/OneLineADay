import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { Text, View } from "react-native";
import { auth, db } from "../firebaseConfig";

class HomeScreen extends React.Component {
  state = { user: {}, isLoading : true };
  
  queryUser = async (user) => {
    let docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists) {
      this.setState({ user: docSnap.data(), isLoading: false });
    }
  }

  async componentDidMount() {
    if (auth.currentUser) {
      await this.queryUser(auth.currentUser);
    }
  }

  render() {
    const { user, isLoading } = this.state;

    if (isLoading) {
      return null;
    }

    return <View>
      <Text>{ user.email }</Text>
    </View>; 
  }
}

export default HomeScreen;