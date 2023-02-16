import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { FlatList, Text, View } from "react-native";
import Entry from "../components/Entry";
import { auth, db } from "../firebaseConfig";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, isLoading : true };
  }
  
  queryUser = async (user) => {
    let docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists) {
      this.setState({ user: docSnap.data(), isLoading: false });

      // Update the screen title
      let date = new Date();
      let monthString = date.toLocaleString("default", { month: "long"});
      let dateString = date.getDate()
      this.navigation.setOptions({ title: "My " + monthString + " " + dateString });
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
      <Text>Loading...</Text>
    }

    return <View>
      <FlatList 
        data={user.entries}
        renderItem={({ item }) => <Entry entry={ item } />} 
      />
    </View>; 
  }
}

export default function(props) {
  const navigation = useNavigation();
  return <HomeScreen {...props} navigation={navigation} />
}