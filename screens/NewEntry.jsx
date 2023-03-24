import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Sentiment from "sentiment";
import EntryEditable from "../components/EntryEditable";
import { auth, db } from "../firebaseConfig";

class NewEntryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.entry = props.route.params.entry;
    this.editing = props.route.params.editing;
    this.onReturn = props.route.params.onReturn;
    this.socialMode = false;
    this.state = {
      text: this.entry.text,
      image: this.entry.image,
      visibility: this.entry.visibility,
      isLoading: true,
    };
    if (this.editing) {
      // Editing an existing entry
      this.navigation.setOptions({
        title: "Edit Entry",
        headerRight: () => (
          <Ionicons
            style={styles.deleteButton}
            name="trash"
            size={28}
            onPress={this.deleteOnPress}
          />
        ),
      });
    }
    this.oldEntry = JSON.parse(JSON.stringify(this.entry));
    this.sentiment = new Sentiment();
  }

  // Save entry
  saveOnPress = () => {
    this.entry.image = this.state.image;
    this.entry.text = this.state.text;
    this.entry.visibility = this.state.visibility;
    this.entry.sentimentScore = this.sentiment.analyze(this.entry.text).score;

    // Named entity recognition
    const MonkeyLearn = require("monkeylearn");
    const ml = new MonkeyLearn("3a189be6097d3eb7528d2270d0d27150b0839869");
    let model_id = "ex_isnnZRbS";
    let data = [this.entry.text];
    ml.extractors.extract(model_id, data).then((res) => {
      let extractions = res.body[0].extractions;
      for (i in extractions) {
        delete extractions[i]["count"];
        delete extractions[i]["parsed_value"];
        delete extractions[i]["positions_in_text"];
      }
      this.entry.extractions = { ...extractions };
      this.onReturn(this.oldEntry, this.entry);
      this.navigation.goBack();
    });
  };

  // Delete entry
  deleteOnPress = () => {
    // Show confirmation message
    Alert.alert("Delete Entry", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: () => {
          this.onReturn(this.oldEntry, null);
          this.navigation.goBack();
        },
      },
    ]);
  };

  // Cancel
  cancelOnPress = () => {
    this.navigation.goBack();
  };

  // On change text
  changeText = (newText) => {
    this.entry.text = newText;
  };

  // Invoked immediately after the component is mounted
  async componentDidMount() {
    this.userRef = doc(db, "users", auth.currentUser.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      this.socialMode = docSnap.data().social_mode;
    }
    this.setState({ isLoading: false });
  }

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>;
    }

    let dateString = moment(this.entry.date, "YYYY-MM-DD").format("MMMM D");

    return (
      <View>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.dateText}>{dateString}</Text>
          <EntryEditable
            entry={this.entry}
            text={this.state.text}
            setText={(newText) => this.setState({ text: newText })}
            image={this.state.image}
            setImage={(newImage) => this.setState({ image: newImage })}
            visibility={this.state.visibility}
            setVisibility={(newVisibility) =>
              this.setState({ visibility: newVisibility })
            }
            navigation={this.navigation}
            socialMode={this.socialMode}
          />
          <Pressable style={styles.saveButton} onPress={this.saveOnPress}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={this.cancelOnPress}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }
}

export default function (props) {
  const navigation = useNavigation();
  return <NewEntryScreen {...props} navigation={navigation} />;
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
    margin: 5,
    fontFamily: "Raleway_500Medium",
  },
  dateText: {
    alignSelf: "center",
    fontSize: 20,
    margin: 15,
    fontFamily: "Raleway_700Bold",
  },
  deleteButton: {
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#305DBF",
    borderRadius: 10,
    height: 80,
    justifyContent: "center",
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
  },
  saveText: {
    alignSelf: "center",
    color: "white",
    fontSize: 20,
    margin: 5,
    fontFamily: "Raleway_500Medium",
  },
  scrollView: {
    height: "100%",
  },
});
