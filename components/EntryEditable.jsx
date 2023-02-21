import * as ImagePicker from 'expo-image-picker';
import moment from "moment";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AutoGrowingTextInput } from "react-native-autogrow-textinput";

const EntryEditable = ({entry, text, setText, image, setImage}) => {
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
      {image && <Image source={{ uri: image }} style={styles.entryImage} />}
      <Pressable style={styles.selectImageButton} onPress={selectImageOnPress}>
        <Text style={styles.selectImageText}>Select Image</Text>
      </Pressable>
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
  selectImageButton: {
    backgroundColor: "#305DBF",
    borderRadius: 10,
    height: 80,
    justifyContent: "center",
    marginTop: 10,
    padding: 10,
    width: "100%",
  },
  selectImageText: {
    alignSelf: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
});