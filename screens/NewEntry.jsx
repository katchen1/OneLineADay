import { useNavigation } from "@react-navigation/native";
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
    this.index = props.route.params.index;
    this.onReturn = props.route.params.onReturn;
    this.state = {text: this.entry.text};
    this.entry.date = moment(this.entry.date);
  }
  
  // Save entry
  saveOnPress = () => {
    this.entry.text = this.state.text;
    this.onReturn(this.entry, this.index);
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

  render() {
    let dateString = this.entry.date.format("MMMM D");

    return <View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.dateText}>{dateString}</Text>
        <EntryEditable entry={this.entry} text={this.state.text} setText={(newText) => this.setState({text: newText})}/>
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