import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CalendarPicker from 'react-native-calendar-picker';
import Modal from "react-native-modal";
import Entry from "../components/Entry";
import { auth, db } from "../firebaseConfig";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, selectedDate: moment(), isCalendarVisible: false, isLoading : true };
  }
  
  // Query user data
  queryUser = async (user) => {
    let docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists) {
      this.setState({ user: docSnap.data(), isLoading: false });
    }
  }

  // Toggle the calendar datepicker on or off
  toggleModal = () => {
    this.setState({ isCalendarVisible: !this.state.isCalendarVisible });
  };

  // Callback of selecting a date in the calendar
  onDateChange = (date) => {
    this.setState({ selectedDate: date });
  }

  // Go to the previous day
  previousDay = () => {
    this.setState({ selectedDate: this.state.selectedDate.subtract(1, 'days')});
  }

  // Go to the next day
  nextDay = () => {
    this.setState({ selectedDate: this.state.selectedDate.add(1, 'days')});
  }

  // Add a journal entry
  createOnPress = () => {
    console.log("create on press");
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
  }

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>
    }

    // Filter entries of the selected date
    let selectedDateString = this.state.selectedDate.format("MMMM D");
    let filteredEntries = this.state.user.entries.filter( entry => {
      let entryDateString = moment(entry.date.toDate()).format("MMMM D");
      return entryDateString == selectedDateString;
    });
    
    // Allow new entry only if the user does not have an entry for this day this year
    let allowNewEntry = true;
    filteredEntries.forEach(
      function(entry) {
        let entryYear = moment(entry.date.toDate()).format("YYYY");
        let thisYear = moment().format("YYYY");
        if (entryYear == thisYear) {
          allowNewEntry = false;
        }
      }
    )

    return <View style={styles.container}>
      <ScrollView>
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
          filteredEntries.map((entry, index) => {
            return <Entry key={index} entry={entry} />;
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
    marginVertical: 250,
  },
});