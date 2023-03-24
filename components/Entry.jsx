import Ionicons from "@expo/vector-icons/Ionicons";
import HighlightText from "@sanar/react-native-highlight-text";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import DialogInput from "react-native-dialog-input";
import { db } from "../firebaseConfig";

const Entry = ({ entry, uid, navigation, index, updateEntry }) => {
  let year = moment(entry.date, "YYYY-MM-DD").year();
  const [likes, setLikes] = useState(entry.likes.slice());
  const [comments, setComments] = useState(entry.comments.slice());
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
    if (entry.name == null) {
      // if NOT in social mode
      navigation.navigate("New Entry", {
        entry: entry,
        editing: true,
        onReturn: (oldEntry, newEntry) =>
          updateEntry(oldEntry, newEntry, index),
      });
    }
  };

  // Add this user to the entry's likes
  likeOnPress = () => {
    // Locally
    entry.likes = likes.concat(uid);
    setLikes(likes.concat(uid));
    // TODO: update in firestore
  };

  // Unlike on press
  unlikeOnPress = () => {
    // Locally
    let index = likes.indexOf(uid);
    let likesNew = likes.slice();
    likesNew.splice(index, 1);
    entry.likes = likesNew;
    setLikes(likesNew);
    // TODO: update in firestore
  };

  // Comment on press
  commentOnPress = () => {
    if (Platform.OS === "ios") {
      // Alert.prompt only works for ios
      Alert.prompt("New Comment", null, [
        { text: "Cancel" },
        {
          text: "OK",
          onPress: (text) => {
            entry.comments = comments.concat({
              uid: uid,
              datetime: moment().format("YYYY-MM-DD-HH-mm-ss"),
              text: text,
            });
            setComments(entry.comments);
          },
        },
      ]);
    } else {
      // Alternative prompt for android
      setModalVisible(true);
    }
    // TODO: update in firestore
  };

  // Comment visibility on press
  commentVisibilityOnPress = () => {
    if (commentsVisible) {
      setCommentsVisible(false);
    } else {
      setCommentsVisible(true);
    }
  };

  // Render a comment
  CommentRender = ({ comment }) => {
    const [name, setName] = useState("");
    let fromNowText = moment(comment.datetime, "YYYY-MM-DD-hh-mm-ss").fromNow();
    queryNameByUid(comment.uid, setName);
    return (
      <View style={styles.comment}>
        <View style={styles.commentHeader}>
          <View style={styles.commentHeaderText}>
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.fromNowText}>{fromNowText}</Text>
          </View>
          {comment.uid == uid ? (
            <Ionicons
              style={styles.deleteIcon}
              name="trash"
              size={20}
              onPress={() => {
                let commentsNew = comments.slice();
                let index = comments.indexOf(comment);
                commentsNew.splice(index, 1);
                Alert.alert("Delete Comment", "Are you sure?", [
                  { text: "Cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      entry.comments = commentsNew;
                      setComments(commentsNew);
                    },
                  },
                ]);
              }}
            />
          ) : (
            <View />
          )}
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
    );
  };

  // Query name by uid
  queryNameByUid = async (uid, setName) => {
    let userRef = doc(db, "users", uid);
    let docSnap = await getDoc(userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      setName(user.name);
    }
  };

  // Get the entry's like/comment statistics to display later
  let numLikes = likes.length;
  let numComments = comments.length;
  let likeText = numLikes == 1 ? " like" : " likes";
  let commentText = numComments == 1 ? " comment" : " comments";
  let likedByUser = likes.includes(uid);

  return (
    <View>
      <DialogInput
        isDialogVisible={modalVisible}
        title={"New Comment"}
        hintInput={"Enter text"}
        cancelText={"Cancel"}
        submitText={"OK"}
        dialogStyle={{ borderRadius: 10, backgroundColor: "white" }}
        modalStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        submitInput={(inputText) => {
          entry.comments = comments.concat({
            uid: uid,
            datetime: moment().format("YYYY-MM-DD-HH-mm-ss"),
            text: inputText,
          });
          setComments(entry.comments);
          setModalVisible(false);
        }}
        closeDialog={() => setModalVisible(false)}
      ></DialogInput>

      <Pressable onPress={entryOnPress}>
        <View style={styles.container}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{yearsAgoText}</Text>
            <Text style={styles.entrySubtitle}>{year}</Text>
          </View>
          <HighlightText
            highlightStyle={styles.highlight}
            searchWords={searchWords}
            textToHighlight={entry.text}
          />
          {entry.image && (
            <Image style={styles.entryImage} source={{ uri: entry.image }} />
          )}

          {entry.name == null ? (
            <View />
          ) : (
            <View style={styles.bottom}>
              <View style={styles.actionRow}>
                {likedByUser ? (
                  <Ionicons
                    style={styles.likeIconFilled}
                    name="heart"
                    size={20}
                    onPress={this.unlikeOnPress}
                  />
                ) : (
                  <Ionicons
                    style={styles.likeIconOutline}
                    name="heart-outline"
                    size={20}
                    onPress={this.likeOnPress}
                  />
                )}
                <Text style={styles.actionText}>{numLikes + likeText}</Text>
                <Ionicons
                  style={styles.commentIcon}
                  name="chatbubble-outline"
                  size={20}
                  onPress={this.commentOnPress}
                />
                <Text style={styles.actionText}>
                  {numComments + commentText}
                </Text>
              </View>
              {numComments > 0 ? (
                <View>
                  {
                    // The "Hide all comments" or "View all comments" button
                    commentsVisible ? (
                      <Text
                        style={styles.viewAllCommentsText}
                        onPress={this.commentVisibilityOnPress}
                      >
                        Hide all commments
                      </Text>
                    ) : (
                      <Text
                        style={styles.viewAllCommentsText}
                        onPress={this.commentVisibilityOnPress}
                      >
                        View all comments
                      </Text>
                    )
                  }
                </View>
              ) : (
                <View />
              )}
              {commentsVisible ? (
                <View>
                  {
                    // List of the entry's comments
                    comments.map((comment, index) => {
                      return <CommentRender key={index} comment={comment} />;
                    })
                  }
                </View>
              ) : (
                <View />
              )}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default Entry;

// Style sheet
const styles = StyleSheet.create({
  actionRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: 10,
  },
  actionText: {
    alignSelf: "center",
    color: "gray",
    marginStart: 3,
    fontFamily: "Raleway_400Regular",
  },
  bottom: {
    width: "100%",
  },
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
  comment: {
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    marginTop: 10,
    padding: 5,
    width: "100%",
    fontFamily: "Raleway_400Regular",
  },
  commentHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentHeaderText: {
    display: "flex",
    flexDirection: "row",
    fontFamily: "Raleway_400Regular",
  },
  commentIcon: {
    color: "gray",
    marginStart: 10,
  },
  deleteIcon: {
    color: "gray",
  },
  entryHeader: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 5,
  },
  entryImage: {
    borderRadius: 10,
    marginTop: 10,
    height: 200,
    resizeMode: "cover",
    width: "100%",
  },
  entrySubtitle: {
    color: "grey",
    fontSize: 14,
    fontFamily: "Raleway_300Light",
  },
  entryText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Raleway_400Regular",
  },
  entryTitle: {
    fontSize: 14,
    marginRight: 5,
    fontFamily: "Raleway_700Bold",
  },
  fromNowText: {
    color: "gray",
    marginBottom: 5,
    marginLeft: 5,
    fontFamily: "Raleway_400Regular",
  },
  highlight: {
    backgroundColor: "yellow",
  },
  likeIconOutline: {
    color: "gray",
  },
  likeIconFilled: {
    color: "#305DBF",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 200,
  },
  nameText: {
    marginBottom: 5,
    fontFamily: "Raleway_500Medium",
  },
  viewAllCommentsText: {
    color: "gray",
    marginTop: 5,
  },
});
