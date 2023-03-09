import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  LineChart
} from "react-native-chart-kit";
import { auth, db } from "../firebaseConfig";


class AnalyticsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { 
      user: {},
      isLoading : true,
      sentimentByDate: {}, 
      entityCounts: {} ,
    };
  }

  // Toggle the calendar datepicker on or off
  shareOnPress = () => {
    console.log("share on press");
  };

  // Get sentiment for showing trend
  getSentiment = () => {
    // Sort entries by date
    let sortedEntries = this.state.user.entries.sort(function(a, b) {
      let aDate = a["date"], bDate = b["date"];
      return ((aDate < bDate)? -1: ((aDate > bDate)? 1: 0));
    });
    // Store date-sentiment pairs in the state
    let sentimentByDate = {};
    sortedEntries.forEach(function(entry) {
      sentimentByDate[entry["date"]] = entry["sentimentScore"];
    });
    this.setState({ sentimentByDate: sentimentByDate });
  }

  // Get named entities and counts for bar charts
  getNamedEntities = () => {
    entityCounts = {"location": {}, "person": {}, "company": {}};
    this.state.user.entries.forEach(function(entry) {
      Object.values(entry.extractions).forEach(function(entity) {
        let tag = entity["tag_name"], word = entity["extracted_text"];
        if (!(word in entityCounts[tag])) {
          entityCounts[tag][word] = 0;
        }
        entityCounts[tag][word] += 1;
      });
    });
    this.setState({ entityCounts: entityCounts });
  }
  
  // Query user data
  queryUser = async (user) => {
    this.userRef = doc(db, "users", user.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      this.setState({ user: user });
      this.getSentiment();
      this.getNamedEntities();
      this.setState({ isLoading: false });
    }
  }

  // Invoked immediately after the component is mounted  
  async componentDidMount() {
    if (auth.currentUser) {
      await this.queryUser(auth.currentUser);
      // Customize the header
      this.navigation.setOptions({ 
        title: "Analytics",
        headerRight: () => (<Ionicons style={styles.shareButton} name="share" size={28} onPress={this.shareOnPress} />)
      });
    }
  }

  render() {
    // Buffer
    if (this.state.isLoading) {
      return <Text>Loading...</Text>
    }

    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        

  <Text>Sentiment Trend</Text>
  <LineChart
    data={{
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          data: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100
          ]
        }
      ]
    }}
    width={Dimensions.get("window").width} // from react-native
    height={220}
    yAxisLabel="$"
    yAxisSuffix="k"
    yAxisInterval={1} // optional, defaults to 1
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />

      </ScrollView>
    </View>; 
  }
}

export default function(props) {
  const navigation = useNavigation();
  return <AnalyticsScreen {...props} navigation={navigation} />
}

// Style sheet
const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 80,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    justifyContent: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  createIcon: {
    alignSelf: "center",
  },
  shareButton: {
    marginRight: 10,
  },
  dateText: {
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "500",
    margin: 5,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 200,
  },
  scrollView: {
    height: "100%",
  },
});