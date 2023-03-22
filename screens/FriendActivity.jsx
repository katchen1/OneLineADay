import { Pressable, StyleSheet, Text, View } from "react-native";

const SocialTab = () => {
  const handleOptIn = () => {
    console.log("User clicked the opt-in button");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tab_description}>
        Connect with your friends and interact with each others' journals.
      </Text>
      <Text style={styles.tab_description}>
        Opt in to the social mode at any time. You will have control over who
        has access to your journal entries.
      </Text>
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: pressed ? "grey" : "#305dbf" },
          styles.optin_button,
        ]}
        onPress={handleOptIn}
      >
        <Text style={styles.optin_text}> Opt In</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optin_button: {
    //backgroundColor: "#305dbf",
    borderRadius: 10,
    height: 60,
    width: 150,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
  },
  optin_text: {
    fontSize: 28,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
  },
  tab_description: {
    fontSize: 18,
    color: "black",
    paddingRight: 50,
    paddingLeft: 50,
    paddingBottom: 15,
    textAlign: "center",
  },
});

export default SocialTab;
