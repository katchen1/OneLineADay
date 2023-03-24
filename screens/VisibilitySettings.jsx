import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../firebaseConfig";

class VisibilitySettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.onReturn = props.route.params.onReturn;
    (this.friends = []),
      (this.state = {
        visibility: props.route.params.visibility,
        isLoading: true,
      });
  }

  // Invoked immediately after the component is mounted
  async componentDidMount() {
    this.queryFriends();
  }

  componentWillUnmount() {
    this.onReturn(this.state.visibility);
  }

  queryFriends = async () => {
    // Query user data to get friend list
    this.userRef = doc(db, "users", auth.currentUser.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      let friendUids = docSnap.data().friends;

      // Now actually query friends data
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if (friendUids.includes(doc.id)) {
          this.friends.push({
            uid: doc.id,
            name: doc.data().name,
            email: doc.data().email,
          });
        }
      });
    }
    this.setState({ isLoading: false });
  };

  selectOnlyMeOnPress = () => {
    let visibilityNew = JSON.parse(JSON.stringify(this.state.visibility));
    visibilityNew.mode = "only_me";
    this.setState({ visibility: visibilityNew });
  };

  selectFriendsOnPress = () => {
    let visibilityNew = JSON.parse(JSON.stringify(this.state.visibility));
    visibilityNew.mode = "friends";
    this.setState({ visibility: visibilityNew });
  };

  selectFriendsExceptOnPress = () => {
    let visibilityNew = JSON.parse(JSON.stringify(this.state.visibility));
    visibilityNew.mode = "friends_except";
    this.setState({ visibility: visibilityNew });
  };

  checkFriendOnPress = (friend) => {
    let visibilityNew = JSON.parse(JSON.stringify(this.state.visibility));
    visibilityNew.friends_except.push(friend.uid);
    this.setState({ visibility: visibilityNew });
  };

  uncheckFriendOnPress = (friend) => {
    let visibilityNew = JSON.parse(JSON.stringify(this.state.visibility));
    let index = visibilityNew.friends_except.indexOf(friend.uid);
    visibilityNew.friends_except.splice(index, 1);
    this.setState({ visibility: visibilityNew });
  };

  // Render a friend item
  ItemRender = ({ friend }) => {
    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.friendNameText}>{friend.name}</Text>
          <Text style={styles.friendEmailText}>{friend.email}</Text>
        </View>
        {this.state.visibility.friends_except.includes(friend.uid) ? (
          <Ionicons
            style={styles.checkBoxIcon}
            name="checkbox"
            size={24}
            onPress={() => this.uncheckFriendOnPress(friend)}
          />
        ) : (
          <Ionicons
            style={styles.checkBoxOutlineIcon}
            name="square-outline"
            size={24}
            onPress={() => this.checkFriendOnPress(friend)}
          />
        )}
      </View>
    );
  };

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Who Can See My Entry</Text>
        <View style={styles.optionsContainer}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Only Me</Text>
            {this.state.visibility.mode == "only_me" ? (
              <Ionicons
                style={styles.checkCircleIcon}
                name="checkmark-circle"
                size={24}
                onPress={() => this.selectOnlyMeOnPress}
              />
            ) : (
              <Ionicons
                style={styles.checkCircleOutlineIcon}
                name="ellipse-outline"
                size={24}
                onPress={this.selectOnlyMeOnPress}
              />
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>My Friends</Text>
            {this.state.visibility.mode == "friends" ? (
              <Ionicons
                style={styles.checkCircleIcon}
                name="checkmark-circle"
                size={24}
                onPress={this.selectFriendsOnPress}
              />
            ) : (
              <Ionicons
                style={styles.checkCircleOutlineIcon}
                name="ellipse-outline"
                size={24}
                onPress={this.selectFriendsOnPress}
              />
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>My Friends, Except...</Text>
            {this.state.visibility.mode == "friends_except" ? (
              <Ionicons
                style={styles.checkCircleIcon}
                name="checkmark-circle"
                size={24}
                onPress={this.selectFriendsExceptOnPress}
              />
            ) : (
              <Ionicons
                style={styles.checkCircleOutlineIcon}
                name="ellipse-outline"
                size={24}
                onPress={this.selectFriendsExceptOnPress}
              />
            )}
          </View>
          {this.state.visibility.mode == "friends_except" ? (
            <FlatList
              data={this.friends}
              renderItem={({ item }) => <this.ItemRender friend={item} />}
              keyExtractor={(item) => item.uid}
              ItemSeparatorComponent={this.ItemDivider}
            />
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  }
}

export default function (props) {
  const navigation = useNavigation();
  return <VisibilitySettingsScreen {...props} navigation={navigation} />;
}

// Style sheet
const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    margin: 10,
    fontFamily: "Raleway_500Medium",
  },
  optionsContainer: {
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },
  optionRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 20,
    margin: 20,
    fontFamily: "Raleway_500Medium",
  },
  checkCircleIcon: {
    color: "#305DBF",
    alignSelf: "center",
    marginHorizontal: 20,
  },
  checkCircleOutlineIcon: {
    color: "gray",
    alignSelf: "center",
    marginHorizontal: 20,
  },
  checkBoxIcon: {
    color: "#305DBF",
    alignSelf: "center",
  },
  checkBoxOutlineIcon: {
    color: "gray",
    alignSelf: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    color: "gray",
  },
  agoText: {
    color: "gray",
    fontSize: 16,
    fontFamily: "Raleway_300Light",
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
    fontFamily: "Raleway_300Light",
  },
  friendNameText: {
    fontSize: 20,
    fontFamily: "Raleway_500Medium",
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
