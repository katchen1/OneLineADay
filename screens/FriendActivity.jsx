import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { collection, doc, documentId, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import moment from "moment";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Entry from "../components/Entry";
import { auth, db } from "../firebaseConfig";

class FriendActivityScreen extends React.Component  {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, isLoading : true, selectedDate: moment(), social_mode: null, filteredEntries: [], friendEntries: [] };
  }

  handleOptIn = async () => {
    await this.queryFriends(this.state.user.friends);
    this.setState({ social_mode: true });
    
    // Update the social_mode field in firestore
    setDoc(this.userRef, { social_mode: true }, { merge: true });

    // Opt-out button
    this.navigation.setOptions({ 
      title: "Friend Activity",
      headerLeft: () => (<Pressable style={styles.optOutButton} onPress={this.handleOptOut}>
        <Text style={styles.optOutText}>Opt Out</Text>
      </Pressable>),
      headerRight: () => (<Ionicons style={styles.friendsButton} name="people" size={28} onPress={this.friendsOnPress} />)
    });
  };  

  handleOptOut = () => {
    this.setState({ social_mode: false });

    // Update the social_mode field in firestore
    setDoc(this.userRef, { social_mode: false }, { merge: true });

    // Opt-out button
    this.navigation.setOptions({ 
      title: "Friend Activity",
      headerLeft: () => (<View/>),
      headerRight: () => (<Ionicons style={styles.friendsButton} name="people" size={28} onPress={this.friendsOnPress} />)
    });
  }

  friendsOnPress = () => {
    console.log("friends on press");
  }

  // Query user data
  queryUser = async (user) => {
    this.userRef = doc(db, "users", user.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      user.uid = docSnap.id;
      this.setState({ user: user, isLoading: false, social_mode: user.social_mode });
      if (user.social_mode) {
        this.queryFriends(user.friends);

        // Opt-out button
        this.navigation.setOptions({ 
          title: "Friend Activity",
          headerLeft: () => (<Pressable style={styles.optOutButton} onPress={this.handleOptOut}>
            <Text style={styles.optOutText}>Opt Out</Text>
          </Pressable>),
          headerRight: () => (<Ionicons style={styles.friendsButton} name="people" size={28} onPress={this.friendsOnPress} />)
        });
      }
    }
  }

  // Query friends data
  queryFriends = async (friendUids) => {
    const q = query(collection(db, "users"), where(documentId(), "in", friendUids));
    const querySnapshot = await getDocs(q);
    userEntries = [...this.state.user.entries];
    userEntries.forEach((entry) => {
      entry.name = this.state.user.name;
    });
    this.setState({friendEntries: userEntries});
    querySnapshot.forEach((doc) => {
      let entries = doc.data().entries;
      entries.forEach((entry) => {
        entry.name = doc.data().name;
      });
      this.setState({friendEntries: this.state.friendEntries.concat(entries)});
    });
    this.filterEntries();
  }

  // Go to the previous day
  previousDay = () => {
    this.setState({ selectedDate: this.state.selectedDate.subtract(1, 'days') });
    this.filterEntries();
  }

  // Go to the next day
  nextDay = () => {
    this.setState({ selectedDate: this.state.selectedDate.add(1, 'days') });
    this.filterEntries();
  }

  // Filter entries of the selected date
  filterEntries = () => {
    let selectedDateString = this.state.selectedDate.format("MMMM D");
    this.setState({filteredEntries: this.state.friendEntries.filter(entry => {
      let entryDateString = moment(entry.date, "YYYY-MM-DD").format("MMMM D");
      return entryDateString == selectedDateString;
    })});
  }

  // Invoked immediately after the component is mounted  
  async componentDidMount() {
    if (auth.currentUser) {
      await this.queryUser(auth.currentUser);
      // Customize the header
      this.navigation.setOptions({ 
        title: "Friend Activity",
        headerRight: () => (<Ionicons style={styles.friendsButton} name="people" size={28} onPress={this.friendsOnPress} />)
      });
    }
  }

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>
    }

    // User has not opt-in, show the opt-in button
    if (!this.state.social_mode) {
      return <View style={styles.container}>
        <Text style={styles.tab_description}>
          Connect with your friends and interact with each others' journals.
        </Text>
        <Text style={styles.tab_description}>
          Opt in to the social mode at any time. You will have control over who
          has access to your journal entries.
        </Text>
        <Pressable
          style={({ pressed }) => [
            { backgroundColor: pressed ? "grey" : "#305dbf" },
            styles.optin_button,
          ]}
          onPress={this.handleOptIn}
        >
          <Text style={styles.optin_text}> Opt In</Text>
        </Pressable>
      </View>;
    }

    // User has opted in, show friends' entries
    let selectedDateString = this.state.selectedDate.format("MMMM D");
    let selectedDateIsToday = this.state.selectedDate.format("MMMM D") == moment().format("MMMM D");
    let selectedDateIsTwoDaysAgo = this.state.selectedDate.format("MMMM D") == moment().subtract(2, 'days').format("MMMM D"); 

    return <View style={styles.containerEntries}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          {selectedDateIsTwoDaysAgo? <View/>: <Ionicons name="arrow-back" size={28} onPress={this.previousDay} />}
          <Text style={styles.dateText}>{selectedDateString}</Text>
          {selectedDateIsToday? <View/>: <Ionicons name="arrow-forward" size={28} onPress={this.nextDay} />}
        </View>
        {
          // List of the user's entry of the selected date
          this.state.filteredEntries.map((entry, index) => {
            return <Entry key={index} uid={this.state.user.uid} entry={entry} navigation={this.navigation} index={index} updateEntry={this.updateEntry}/>;
          })
        }
      </ScrollView>
    </View>
  }
};

export default function(props) {
  const navigation = useNavigation();
  return <FriendActivityScreen {...props} navigation={navigation} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  containerEntries: {
    display: "flex",
    flexDirection: "column",
  },
  optin_button: {
    //backgroundColor: "#305dbf",
    borderRadius: 10,
    height: 60,
    width: 150,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
  },
  optin_text: {
    fontSize: 28,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
  },
  tab_description: {
    fontSize: 18,
    color: "#263238",
    paddingRight: 50,
    paddingLeft: 50,
    paddingBottom: 15,
    textAlign: "center",
  },
  friendsButton: {
    marginRight: 10,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  scrollView: {
    height: "100%",
  },
  dateText: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
  optOutButton: {
    backgroundColor: "#305DBF",
    marginLeft: 10,
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
  },
  optOutText: {
    color: "white",
  },
});
