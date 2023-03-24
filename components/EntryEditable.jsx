import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AutoGrowingTextInput } from "react-native-autogrow-textinput";

const EntryEditable = ({
  entry,
  text,
  setText,
  image,
  setImage,
  visibility,
  setVisibility,
  navigation,
  socialMode,
}) => {
  let year = moment(entry.date, "YYYY-MM-DD").year();

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

  // Launch image picker and update entry with the new image's URI
  const selectImageOnPress = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const visibilityOnPress = () => {
    navigation.navigate("Visibility Settings", {
      visibility: visibility,
      onReturn: (newVisibility) => {
        setVisibility(newVisibility);
      },
    });
  };

  const removeImageOnPress = () => {
    setImage("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.entryHeader}>
        <View style={styles.entryHeaderText}>
          <Text style={styles.entryTitle}>{yearsAgoText}</Text>
          <Text style={styles.entrySubtitle}>{year}</Text>
        </View>
        {socialMode ? (
          <Ionicons
            style={styles.visibilityIcon}
            name="eye"
            size={24}
            onPress={visibilityOnPress}
          />
        ) : (
          <View />
        )}
      </View>
      <AutoGrowingTextInput
        style={styles.input}
        placeholder="Enter text"
        onChangeText={setText}
        value={text}
      />
      {image && <Image source={{ uri: image }} style={styles.entryImage} />}
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.selectImageButton}
          onPress={selectImageOnPress}
        >
          <Text style={styles.selectImageText}>Select Image</Text>
        </Pressable>
        {image == "" ? (
          <View />
        ) : (
          <Pressable
            style={styles.removeImageButton}
            onPress={removeImageOnPress}
          >
            <Text style={styles.removeImageText}>Remove</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default EntryEditable;

// Style sheet
const styles = StyleSheet.create({
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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
  entryHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    width: "100%",
  },
  entryHeaderText: {
    display: "flex",
    flexDirection: "row",
    fontFamily: "Raleway_400Regular",
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
    fontFamily: "Raleway_300Light",
  },
  entryText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Raleway_300Light",
  },
  entryTitle: {
    fontSize: 14,
    marginRight: 5,
    fontFamily: "Raleway_500Medium",
  },
  input: {
    width: "100%",
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "Raleway_300Light",
  },
  removeImageButton: {
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    height: 80,
    justifyContent: "center",
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    width: "48%",
  },
  removeImageText: {
    alignSelf: "center",
    fontSize: 20,
    margin: 5,
    fontFamily: "Raleway_500Medium",
  },
  selectImageButton: {
    backgroundColor: "#305DBF",
    borderRadius: 10,
    height: 80,
    justifyContent: "center",
    marginTop: 10,
    padding: 10,
    width: "48%",
  },
  selectImageText: {
    alignSelf: "center",
    color: "white",
    fontSize: 20,
    margin: 5,
    fontFamily: "Raleway_500Medium",
  },
  visibilityIcon: {
    color: "#305DBF",
    alignSelf: "center",
  },
});
