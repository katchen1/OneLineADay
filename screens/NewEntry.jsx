import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React from "react";
import { LogBox, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import EntryEditable from "../components/EntryEditable";

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

class NewEntryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.entry = props.route.params.entry;
    this.editing = props.route.params.editing;
    this.onReturn = props.route.params.onReturn;
    this.state = {text: this.entry.text, image: this.entry.image};
    if (this.editing) {
      // Editing an existing entry
      this.navigation.setOptions({ 
        title: "Edit Entry",
        headerRight: () => (<Ionicons style={styles.deleteButton} name="trash" size={28} onPress={this.deleteOnPress} />)
      });
    }
    this.oldEntry = JSON.parse(JSON.stringify(this.entry));
  }
  
  // Save entry
  saveOnPress = () => {
    if (this.oldEntry.image == this.state.image) {
      this.handleReturn();
    } else {
      this.uploadImage(this.state.image);
    }
  }

  // Delete entry
  deleteOnPress = () => {
    this.onReturn(this.oldEntry, null);
    this.navigation.goBack();
  }

  // Cancel
  cancelOnPress = () => {
    this.navigation.goBack();
  }

  // On change text
  changeText = (newText) => {
    this.entry.text = newText;
  }

  // Handle return
  handleReturn = () => {
    this.entry.text = this.state.text;
    this.onReturn(this.oldEntry, this.entry);
    this.navigation.goBack();
  }

  // Upload image
  uploadImage = async (uri) => {
    let time = new Date().getTime().toString();
    const storageRef = ref(getStorage(), "images/" + time + ".png");
    const response = await fetch(uri);
    const blob = await response.blob();
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    this.entry.image = downloadURL;
    this.handleReturn();
  }

  render() {
    let dateString = moment(this.entry.date, "YYYY-MM-DD").format("MMMM D");

    return <View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.dateText}>{dateString}</Text>
        <EntryEditable 
          entry={this.entry} 
          text={this.state.text} setText={(newText) => this.setState({text: newText})}
          image={this.state.image} setImage={(newImage) => this.setState({image: newImage})}
        />
        <Pressable style={styles.saveButton} onPress={this.saveOnPress}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={this.cancelOnPress}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>; 
  }
}

export default function(props) {
  const navigation = useNavigation();
  return <NewEntryScreen {...props} navigation={navigation} />
}

// Style sheet
const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 80,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
  },
  cancelText: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
  dateText: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "500",
    margin: 15,
  },
  deleteButton: {
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#305DBF",
    borderRadius: 10,
    height: 80,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
  },
  saveText: {
    alignSelf: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
  scrollView: {
    height: "100%",
  },
});