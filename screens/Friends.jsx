import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { db } from "../firebaseConfig";

class FriendsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      friendUids: props.route.params.data, // list of friend uids
      friends: [], // each friend has uid, name, email
      isLoading : true,
    };
  }

  // Invoked immediately after the component is mounted  
  async componentDidMount() {
    this.navigation.setOptions({ title: "Friends"});
    this.queryFriends();
  }

  // Query friends by list of uids
  queryFriends = async() => {
    const q = query(collection(db, "users"), where(documentId(), "in", this.state.friendUids));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      let friendUid = doc.id;
      let friendName = doc.data().name;
      let friendEmail = doc.data().email;
      this.setState({friends: this.state.friends.concat({uid: friendUid, name: friendName, email: friendEmail})});
    });
    this.setState({isLoading: false});
  }

  // When the remove friend button is pressed
  removeFriendOnPress = () => {
    console.log("remove friend on press");
  }

  // Render a friend item
  ItemRender = ({ friend }) => {
    return <View style={styles.item}>
      <View style>
        <Text style={styles.friendNameText}>{friend.name}</Text>
        <Text style={styles.friendEmailText}>{friend.email}</Text>
      </View>
      <Ionicons style={styles.removeButton} name="person-remove" size={28} onPress={this.removeFriendOnPress} />
    </View>
  }

  ItemDivider = () => {
    return <View style={styles.divider} />
  }
  
  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>
    }
    return <View>
      <FlatList
        data={this.state.friends}
        renderItem={({ item }) => <this.ItemRender friend={item} />}
        keyExtractor={item => item.uid}
        ItemSeparatorComponent={this.ItemDivider}
      />
    </View>; 
  }
}

export default function(props) {
  const navigation = useNavigation();
  return <FriendsScreen {...props} navigation={navigation} />
}

// Style sheet
const styles = StyleSheet.create({
  agoText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "300",
  },
  divider: {
    alignSelf: "center",
    backgroundColor: "gray",
    height: 1,
    width: "90%",
  },
  friendEmailText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "300",
  },
  friendNameText: {
    fontSize: 20,
    fontWeight: "500",
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  removeButton: {
    alignSelf: "center",
    color: "#305DBF",
  }
});