import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const Entry = ({entry}) => {
  // Convert Firestore datetime to javascript date
  let year = entry.date.toDate().getFullYear();
  
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
    <Pressable
      onPress={() => {
        console.log("Entry pressed")
      }}
    >
      <View style={styles.container}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{ yearsAgoText }</Text>
          <Text style={styles.entrySubtitle}>{ year }</Text>
        </View>
        <Text style={styles.entryText}>{ entry.text }</Text>
        <Image style={styles.entryImage} source={{ uri: "https://picsum.photos/300/200" }} />
      </View>
    </Pressable>
  );
}

export default Entry;

// Style
const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    alignItems: "left",
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  entryImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
  },
  entryHeader: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 5,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  entrySubtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "grey",
  },
  entryText: {
    fontSize: 14,
    fontWeight: "300",
    marginBottom: 5,
  }
});