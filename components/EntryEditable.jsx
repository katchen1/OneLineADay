import React from "react";
import { Image, LogBox, StyleSheet, Text, View } from "react-native";
import { AutoGrowingTextInput } from "react-native-autogrow-textinput";

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const EntryEditable = ({entry, text, setText}) => {
  let year = entry.date.year();
  
  // Calculate years ago
  let yearsAgoText = "";
  let yearsAgo = new Date().getFullYear() - year;
  if (yearsAgo == 0) {
    yearsAgoText = "This Year";
  } else if (yearsAgo == 1) {
    yearsAgoText = "1 Year Ago";
  } else if (yearsAgo > 1) {
    yearsAgoText = yearsAgo + " Years Ago";
  }

  return (
    <View style={styles.container}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{ yearsAgoText }</Text>
        <Text style={styles.entrySubtitle}>{ year }</Text>
      </View>
      <AutoGrowingTextInput
        style={styles.input}
        placeholder="Enter text"
        onChangeText={setText}
        value={text}
      />
      <Image style={styles.entryImage} source={{ uri: "https://picsum.photos/300/200" }} />
    </View>
  );
}

export default EntryEditable;

// Style sheet
const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
  },
  entryHeader: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 5,
  },
  entryImage: {
    borderRadius: 10,
    height: 200,
    resizeMode: "cover",
    width: "100%", 
  },
  entrySubtitle: {
    color: "grey",
    fontSize: 14,
    fontWeight: "300",
  },
  entryText: {
    fontSize: 14,
    fontWeight: "300",
    marginBottom: 5,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  input: {
    width: "100%",
    fontSize: 14,
    fontWeight: "300",
    marginBottom: 10,
  },
});