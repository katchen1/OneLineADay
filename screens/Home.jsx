import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import moment from "moment";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CalendarPicker from 'react-native-calendar-picker';
import Modal from "react-native-modal";
import Toast from "react-native-root-toast";
import Entry from "../components/Entry";
import { auth, db } from "../firebaseConfig";
import { useSwipe } from "../hooks/useSwipe";


class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, filteredEntries: [], selectedDate: moment(), isCalendarVisible: false, isLoading : true, };
  }
  
  // Query user data
  queryUser = async (user) => {
    this.userRef = doc(db, "users", user.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      user.uid = docSnap.id;
      this.setState({ user: user, isLoading: false });
      this.filterEntries();
    }
  }

  // Toggle the calendar datepicker on or off
  toggleModal = () => {
    this.setState({ isCalendarVisible: !this.state.isCalendarVisible });
  };

  // Callback of selecting a date in the calendar
  onDateChange = (newDate) => {
    this.setState({ selectedDate: this.state.selectedDate.set(moment(newDate).toObject()) });
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

  // Update entry
  updateEntry = async (oldEntry, newEntry, index) => {
    if (newEntry == null) {
      // Delete an entry
      let i = this.state.user.entries.indexOf(this.state.filteredEntries[index]);
      if (oldEntry.image != "") {
        oldEntry.image = "https://picsum.photos/300/200"; 
      }
      await updateDoc(this.userRef, {
        entries: arrayRemove(oldEntry)
      });
      delete this.state.user.entries[i];
      Toast.show("Entry deleted");
    } else {
      // NOTE: Ideally, we want upload user's images to Firebase Storage, but
      // the quota has been exceeded for this project. We need to pay to upgrade.
      // So we resort to updating the images locally without data persistence.
      let temp = newEntry.image;
      if (newEntry.image != "") {
        newEntry.image = "https://picsum.photos/300/200";
      }
      if (index == -1) {
        // Create a new entry
        await updateDoc(this.userRef, {
          entries: arrayUnion(newEntry)
        });
        newEntry.image = temp;
        this.state.user.entries.push(newEntry);
        Toast.show("Entry created");
      } else {
        // Update an existing entry
        await updateDoc(this.userRef, {
          entries: arrayRemove(oldEntry)
        });
        await updateDoc(this.userRef, {
          entries: arrayUnion(newEntry)
        });
        newEntry.image = temp;
        Toast.show("Entry updated");
      }
    }
    this.filterEntries();
  }

  // Filter entries of the selected date
  filterEntries = () => {
    let selectedDateString = this.state.selectedDate.format("MMMM D");
    this.setState({filteredEntries: this.state.user.entries.filter(entry => {
      let entryDateString = moment(entry.date, "YYYY-MM-DD").format("MMMM D");
      return entryDateString == selectedDateString;
    }).sort((entry1, entry2) => {
      return moment(entry2.date, "YYYY-MM-DD") - moment(entry1.date, "YYYY-MM-DD");
    })});
  }

  // Add a journal entry
  createOnPress = () => {
    this.navigation.navigate("New Entry", {
      entry: {
        text: "", 
        date: this.state.selectedDate.format("YYYY-MM-DD"), 
        image: "", 
        likes: [], 
        comments: [], 
        visibility: {mode: "friends", friends_except: []}
      }, 
      editing: false,
      onReturn: (oldEntry, newEntry) => this.updateEntry(oldEntry, newEntry, -1),
    });
  }

  onSwipeLeft = () => {
    this.nextDay();
  }

  onSwipeRight = () => {
    this.previousDay();
  }

  // Invoked immediately after the component is mounted  
  async componentDidMount() {
    if (auth.currentUser) {
      await this.queryUser(auth.currentUser);
      // Customize the header
      this.navigation.setOptions({ 
        title: "My Journal",
        headerRight: () => (<Ionicons style={styles.dateButton} name="calendar" size={28} onPress={this.toggleModal} />)
      });
    }

    // Gesture handling
    const { onTouchStart, onTouchEnd } = useSwipe(this.onSwipeLeft, this.onSwipeRight, 6);
    this.onTouchStart = onTouchStart;
    this.onTouchEnd = onTouchEnd;
    console.log(this.onTouchStart, this.onTouchEnd);
  }

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>
    }

    let selectedDateString = this.state.selectedDate.format("MMMM D"); 
    
    // Allow new entry only if the user does not have an entry for this day this year
    let allowNewEntry = true;
    this.state.filteredEntries.forEach(
      function(entry) {
        let entryYear = moment(entry.date, "YYYY-MM-DD").format("YYYY");
        let thisYear = moment().format("YYYY");
        if (entryYear == thisYear) {
          allowNewEntry = false;
        }
      }
    )

    return <View style={styles.container}>
      <ScrollView style={styles.scrollView} onTouchStart={(e) => this.onTouchStart(e)} onTouchEnd={(e) => this.onTouchEnd(e)}>
        <View style={styles.header}>
          <Ionicons name="arrow-back" size={28} onPress={this.previousDay} />
          <Text style={styles.dateText}>{selectedDateString}</Text>
          <Ionicons name="arrow-forward" size={28} onPress={this.nextDay} />
        </View>

        {
          // The "create" button
          allowNewEntry? <Pressable style={styles.addButton} onPress={this.createOnPress}>
            <Ionicons style={styles.createIcon} name="create" size={28} color="#305DBF" />
          </Pressable> : <View/>
        }
        
        {
          // List of the user's entry of the selected date
          this.state.filteredEntries.map((entry, index) => {
            return <Entry key={index} entry={entry} uid={this.state.user.uid} navigation={this.navigation} index={index} updateEntry={this.updateEntry}/>;
          })
        }
      </ScrollView>

      <Modal 
        isVisible={this.state.isCalendarVisible}
        onBackdropPress={this.toggleModal}
        style={styles.modal}
      >
        <CalendarPicker
          maxDate={new Date("December 31, " + new Date().getFullYear())}
          minDate={new Date("January 1, " + new Date().getFullYear())}
          nextComponent={<Ionicons name="arrow-forward" size={24} />}
          onDateChange={this.onDateChange}
          previousComponent={<Ionicons name="arrow-back" size={24} />}
          restrictMonthNavigation={true}
          selectedDayColor="#305DBF"
          selectedDayTextColor="#FFFFFF"
        />
      </Modal>
    </View>; 
  }
}

export default function(props) {
  const navigation = useNavigation();
  return <HomeScreen {...props} navigation={navigation} />
}

// Style sheet
const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 80,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  createIcon: {
    alignSelf: "center",
  },
  dateButton: {
    marginRight: 10,
  },
  dateText: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 200,
  },
  scrollView: {
    height: "100%",
  },
});