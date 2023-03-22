import Ionicons from "@expo/vector-icons/Ionicons";
import HighlightText from "@sanar/react-native-highlight-text";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { db } from "../firebaseConfig";


const Entry = ({entry, uid, navigation, index, updateEntry}) => {
  let year = moment(entry.date, "YYYY-MM-DD").year();
  const [likes, setLikes] = useState(entry.likes.slice());
  const [comments, setComments] = useState(entry.comments.slice());
  const [commentsVisible, setCommentsVisible] = useState(false);
  
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

  // Add this user to the entry's likes
  likeOnPress = () => {
    // Locally
    setLikes(likes.concat(uid));

    // TODO: update in firestore
  }

  // Unlike on press
  unlikeOnPress = () => {
    // Locally
    let index = likes.indexOf(uid);
    let likesNew = likes.slice();
    likesNew.splice(index);
    setLikes(likesNew);

    // TODO: update in firestore
  }

  // Comment on press
  commentOnPress = () => {
    Alert.prompt(
      "New Comment",
      null,
      [
        {
          text: "Cancel",
        },
        {
          text: "OK",
          onPress: text => setComments(
            comments.concat({uid: uid, datetime: moment().format("YYYY-MM-DD-HH-mm-ss"), text: text})
          )
        }
      ],
    );
  }

  // Comment visibility on press
  commentVisibilityOnPress = () => {
    if (commentsVisible) {
      setCommentsVisible(false);
    } else {
      setCommentsVisible(true);
    }
  }

  CommentRender = ({ comment }) => {
    const [name, setName] = useState("");
    let fromNowText = moment(comment.datetime, "YYYY-MM-DD-hh-mm-ss").fromNow();
    queryNameByUid(comment.uid, setName);
    return <View style={styles.comment}>
      <View style={styles.commentHeader}>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.fromNowText}>{fromNowText}</Text>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
    </View>
  }

  // Query name by uid
  queryNameByUid = async (uid, setName) => {
    let userRef = doc(db, "users", uid);
    let docSnap = await getDoc(userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      setName(user.name);
    }
  }

  let numLikes = likes.length;
  let numComments = comments.length;
  let likeText = numLikes == 1? " like": " likes";
  let commentText = numComments == 1? " comment": " comments";
  let likedByUser = likes.includes(uid);

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
          entry.name == null? <View/>:
          <View style={styles.bottom}>
            <View style={styles.actionRow}>
              {
                likedByUser? <Ionicons style={styles.likeIcon} name="heart" size={20} onPress={this.unlikeOnPress} />: 
                <Ionicons style={styles.likeIcon} name="heart-outline" size={20} onPress={this.likeOnPress} />
              }
              <Text style={styles.actionText}>{numLikes + likeText}</Text>
              <Ionicons style={styles.commentIcon} name="chatbubble-outline" size={20} onPress={this.commentOnPress} />
              <Text style={styles.actionText}>{numComments + commentText}</Text>
            </View>
            {
              numComments > 0? <View>
                {
                  commentsVisible? 
                  <Text style={styles.viewAllCommentsText} onPress={this.commentVisibilityOnPress}>Hide all commments</Text> : 
                  <Text style={styles.viewAllCommentsText} onPress={this.commentVisibilityOnPress}>View all comments</Text>
                }
              </View> : <View/>
            }
            {
              commentsVisible? <View>
                {
                  // List of the entry's comments
                  comments.map((comment, index) => {
                    return <CommentRender key={index} comment={comment}/>;
                  })
                }
              </View>: <View/>
            }
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
    display: "flex",
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
  },
  viewAllCommentsText: {
    color: "gray"
  },
  commentHeader: {
    display: "flex",
    flexDirection: "row",
  },
  comment: {
    marginTop: 10,
    backgroundColor: "#EEEEEE",
    padding: 5,
    borderRadius: 10,
    width: "100%",
  },
  fromNowText: {
    marginLeft: 5,
    color: "gray",
  },
  nameText: {
    fontWeight: "500",
  },
  bottom: {
    width: "100%",
  }
});