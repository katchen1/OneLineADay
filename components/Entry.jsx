import moment from "moment";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const Entry = ({entry, navigation, index, updateEntry}) => {
  let year = moment(entry.date, "YYYY-MM-DD").year();
  
  // Calculate years ago
  let yearsAgoText = "";
  let yearsAgo = moment().year() - year;
  if (yearsAgo == 0) {
    yearsAgoText = "This Year";
  } else if (yearsAgo == 1) {
    yearsAgoText = "1 Year Ago";
  } else if (yearsAgo > 1) {
    yearsAgoText = yearsAgo + " Years Ago";
  }

  return (
    <Pressable
      onPress={() => {
        navigation.navigate("New Entry", {
          entry: entry,
          editing: true,
          onReturn: (oldEntry, newEntry) => updateEntry(oldEntry, newEntry, index),
        });
      }}
    >
      <View style={styles.container}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{ yearsAgoText }</Text>
          <Text style={styles.entrySubtitle}>{ year }</Text>
        </View>
        <Text style={styles.entryText}>{ entry.text }</Text>
        {entry.image && <Image style={styles.entryImage} source={{ uri: entry.image }} />}
      </View>
    </Pressable>
  );
}

export default Entry;

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
});