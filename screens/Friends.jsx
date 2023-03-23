import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import Toast from "react-native-root-toast";
import { auth, db } from "../firebaseConfig";

class FriendsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.onReturn = props.route.params.onReturn;
    this.state = {
      friendUids: props.route.params.data, // list of friend uids
      friends: [], // each friend has uid, name, email
      isLoading : true,
      query: "",
      filteredFriends: [],
      allUsers: [],
    };
  }

  // Invoked immediately after the component is mounted  
  async componentDidMount() {
    this.navigation.setOptions({ title: "Friends"});
    this.userRef = doc(db, "users", auth.currentUser.uid);
    this.queryFriends();
  }

  componentWillUnmount() {
    this.onReturn();
  }

  // Query friends by list of uids
  queryFriends = async() => {
    let friends = [];
    let allUsers = [];
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      let uid = doc.id;
      let name = doc.data().name;
      let email = doc.data().email;
      if (uid != auth.currentUser.uid) {
        allUsers.push({uid: uid, name: name, email: email});
      }
      if (this.state.friendUids.includes(uid)) {
        friends.push({uid: uid, name: name, email: email});
      }
    });
    this.setState({friends: friends, allUsers: allUsers, isLoading: false});
  }

  // When the remove friend button is pressed
  removeFriendOnPress = (user) => {
    let friendsNew = this.state.friends.slice();
    let index = -1;
    for (let i = 0; i < friendsNew.length; i++) {
      if (friendsNew[i].uid == user.uid) {
        index = i;
        break;
      }
    }
    friendsNew.splice(index, 1);
    this.setState({friends: friendsNew});
    Toast.show("Friend removed");
    this.removeFriendFirestore(user.uid);
  }

  removeFriendFirestore = async(friendUid) => {
    // Remove friend from user's list
    let friendUidsNew = this.state.friendUids.slice();
    let index = friendUidsNew.indexOf(friendUid);
    friendUidsNew.splice(index, 1);
    this.setState({friendUids: friendUidsNew});
    setDoc(this.userRef, { friends: friendUidsNew }, { merge: true }); 

    // Remove user from friend's list
    let friendRef = doc(db, "users", friendUid);
    let docSnap = await getDoc(friendRef);
    if (docSnap.exists) {
      friendUidsNew = docSnap.data().friends;
      index = friendUidsNew.indexOf(auth.currentUser.uid);
      friendUidsNew.splice(index, 1);
      setDoc(friendRef, { friends: friendUidsNew }, { merge: true });
    }
  }

  // When the add friend button is pressed
  addFriendOnPress = (user) => {
    this.setState({friends: this.state.friends.concat(user)});
    Toast.show("Friend added");
    this.addFriendFirestore(user.uid);
  }

  addFriendFirestore = async(friendUid) => {
    // Add friend to user's list
    let friendUidsNew = this.state.friendUids.concat(friendUid);
    this.setState({friendUids: friendUidsNew});
    setDoc(this.userRef, { friends: friendUidsNew }, { merge: true });

    // Add user to friend's list
    // Remove user from friend's list
    let friendRef = doc(db, "users", friendUid);
    let docSnap = await getDoc(friendRef);
    if (docSnap.exists) {
      friendUidsNew = docSnap.data().friends.concat(auth.currentUser.uid);
      setDoc(friendRef, { friends: friendUidsNew }, { merge: true });
    } 
  }

  // Render a friend item
  ItemRender = ({ friend }) => {
    return <View style={styles.item}>
      <View>
        <Text style={styles.friendNameText}>{friend.name}</Text>
        <Text style={styles.friendEmailText}>{friend.email}</Text>
      </View>
      <Ionicons style={styles.removeButton} name="person-remove" size={28} onPress={() => this.removeFriendOnPress(friend)} />
    </View>
  }

  ItemDivider = () => {
    return <View style={styles.divider} />
  }

  friendQueryOnChange = (text) => {
    this.setState({ query: text });
    if (text) {
      // Making a case insensitive regular expression
      const regex = new RegExp(`${text.trim()}`, 'i');
      // Setting the filtered friends array according to the query
      this.setState({filteredFriends: 
        this.state.allUsers.filter(
          (user) => user.email.search(regex) >= 0 || user.name.search(regex) >= 0
        )
      });
    } else {
      // If the query is null then return blank
      this.setState({filteredFriends: []});
    }
  }
  
  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>
    }

    return <View style={styles.container}>
      <Autocomplete inputContainerStyle={styles.autocomplete}
        data={this.state.filteredFriends}
        value={this.state.query}
        placeholder="Search friends..."
        onChangeText={(text) => this.friendQueryOnChange(text)}
        flatListProps={{
          keyExtractor: (_, idx) => idx,
          renderItem: ({ item }) => <View style={styles.searchItem}>
            <View>
              <Text style={styles.friendNameText}>{item.name}</Text>
              <Text style={styles.friendEmailText}>{item.email}</Text>
            </View>
            {
              this.state.friends.some(e => e.email === item.email)?
                <Ionicons style={styles.removeButton} name="person-remove" size={28} onPress={() => this.removeFriendOnPress(item)} />:
                <Ionicons style={styles.removeButton} name="person-add" size={28} onPress={() => this.addFriendOnPress(item)} />
            }
          </View>,
          style: styles.list,
        }}
        listContainerStyle={styles.listContainer}
      />
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
  autocomplete: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    padding: 5,
    backgroundColor: "white",
  },
  container: {
    width: "100%",
    position: 'absolute',
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
  list: {
    borderRadius: 10,
    padding: 5,
    backgroundColor: "white",
  },
  listContainer: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  removeButton: {
    alignSelf: "center",
    color: "#305DBF",
  },
  searchItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 5,
  },
});