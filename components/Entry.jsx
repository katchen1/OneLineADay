import Ionicons from "@expo/vector-icons/Ionicons";
import HighlightText from "@sanar/react-native-highlight-text";
import moment from "moment";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const Entry = ({entry, uid, navigation, index, updateEntry}) => {
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
  
  // Social mode
  if (entry.name != null) {
    yearsAgoText = entry.name;
    year = moment(entry.date, "YYYY-MM-DD").fromNow();
  }

  // Named entities to be highlighted
  let searchWords = [];
  for (i in entry.extractions) {
    searchWords.push(entry.extractions[i]["extracted_text"]);
  }

  // Handle entry on press
  entryOnPress = () => {
    if (entry.name == null) { // if NOT in social mode
      navigation.navigate("New Entry", {
        entry: entry,
        editing: true,
        onReturn: (oldEntry, newEntry) => updateEntry(oldEntry, newEntry, index),
      });
    } 
  }

  // Like on press
  likeOnPress = () => {
    console.log("like on press");
  }

  // Unlike on press
  unlikeOnPress = () => {
    console.log("unlike on press");
  }

  // Comment on press
  commentOnPress = () => {
    console.log("comment on press");
  }


  let numLikes = entry.likes.length;
  let numComments = entry.comments.length;
  let likeText = numLikes == 1? " like": " likes";
  let commentText = numComments == 1? " comment": " comments";
  let likedByUser = entry.likes.includes(uid);

  return (
    <Pressable onPress={entryOnPress}>
      <View style={styles.container}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{ yearsAgoText }</Text>
          <Text style={styles.entrySubtitle}>{ year }</Text>
        </View>
        <HighlightText
          highlightStyle={styles.highlight}
          searchWords={searchWords}
          textToHighlight={entry.text}
        />
        {entry.image && <Image style={styles.entryImage} source={{ uri: entry.image }} />}

        {
          entry.name == null? <View/>: <View style={styles.actionRow}>
            {
              likedByUser? <Ionicons style={styles.likeIcon} name="heart" size={20} onPress={this.unlikeOnPress} />: 
              <Ionicons style={styles.likeIcon} name="heart-outline" size={20} onPress={this.likeOnPress} />
            }
            <Text style={styles.actionText}>{numLikes + likeText}</Text>
            <Ionicons style={styles.commentIcon} name="chatbubble-outline" size={20} onPress={this.commentOnPress} />
            <Text style={styles.actionText}>{numComments + commentText}</Text>
          </View>
        }
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
  highlight: {
    backgroundColor: "yellow",
  },
  actionRow: {
    marginBottom: 10,
    marginTop: 20,
    isplay: "flex",
    flexDirection: "row",
    marginBottom: 5,
  },
  actionText: {
    alignSelf: "center",
    marginStart: 3,
    color: "gray",
  },
  commentIcon: {
    marginStart: 10,
    color: "gray",
  },
  likeIcon: {
    color: "gray",
  }
});