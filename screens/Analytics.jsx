import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { auth, db } from "../firebaseConfig";


class AnalyticsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, isLoading : true };
  }

  // Toggle the calendar datepicker on or off
  shareOnPress = () => {
    console.log("share on press");
  };

  // Get sentiment for showing trend
  getSentiment = () => {
    // Initialize all points to neutral sentiment
    let output = {}
    for (let i = 14; i >= 0; i--) {
      output[i] = 0;
    }
    // Get sentiment scores from the past 2 weeks
    this.state.user.entries.forEach(function(entry) {
      let entryDate = moment(entry["date"], 'YYYY-MM-DD');
      let daysAgo = moment().diff(entryDate, "days");
      if (daysAgo <= 14) {
        output[daysAgo] = entry["sentimentScore"];
      }
    });
    return output;
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
    return entityCounts;
  }
  
  // Query user data
  queryUser = async (user) => {
    this.userRef = doc(db, "users", user.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      this.setState({ user: user, isLoading: false });
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

    // Line chart
    let daysAgoToSentiment = this.getSentiment();
    let lineChartLabels = [...Object.keys(daysAgoToSentiment)].reverse(); 
    let lineChartData = [...Object.values(daysAgoToSentiment)].reverse();
    let range = Math.max(Math.abs(Math.min(...lineChartData)), Math.abs(Math.max(...lineChartData)));

    // Bar charts
    let entityCounts = this.getNamedEntities();
    let personLabels = [...Object.keys(entityCounts["person"])];
    let personData = [...Object.values(entityCounts["person"])];
    let locationLabels = [...Object.keys(entityCounts["location"])];
    let locationData = [...Object.values(entityCounts["location"])];
    let companyLabels = [...Object.keys(entityCounts["company"])];
    let companyData = [...Object.values(entityCounts["company"])];

    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.chart}>
          <Text style={styles.chartTitle}>Sentiment Trend</Text>
          <Ionicons style={styles.sentimentIcon} name="happy" size={20} color="green" />
          <LineChart
            data={{
              labels: lineChartLabels,
              datasets: [{data: lineChartData}, { data: [-1 * range, range], color: () => 'transparent'} ]
            }}
            width={Dimensions.get("window").width - 10} // from react-native
            height={200}
            padding={10}
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              decimalPlaces: 0, // optional, defaults to 2dp
              fillShadowGradientFrom: "transparent",
              fillShadowGradientFromOpacity: 0,
              fillShadowGradientTo: "transparent",
              fillShadowGradientToOpacity: 0,
              color: () => "#305DBF",
              labelColor: () => "gray",
              propsForDots: {r: "5"},
            }}
            bezier
            style={{
              borderRadius: 10,
              paddingRight: 35,
            }}
          />
          <Ionicons style={styles.sentimentIcon} name="sad" size={20} color="red" />
          <Text style={styles.axisTitle}>Days Ago</Text>
        </View>


        <View style={styles.chart}>
          <Text style={styles.chartTitle}>Places Mentioned</Text>
          <BarChart
            data={{
              labels: locationLabels,
              datasets: [{data: locationData}],
            }}
            yAxisInterval={1}
            fromZero
            showValuesOnTopOfBars
            width={Dimensions.get("window").width - 10} // from react-native
            height={200}
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              fillShadowGradientFrom: "#305DBF",
              fillShadowGradientTo: "#305DBF",
              fillShadowGradientFromOpacity: 1,
              fillShadowGradientToOpacity: 1,
              decimalPlaces: 1, // optional, defaults to 2dp
              color: () => "#305DBF",
              labelColor: () => "gray",
              propsForDots: {r: "5"},
            }}
            verticalLabelRotation={0}
            style={{
              borderRadius: 10,
              paddingRight: 40,
            }}
          />
        </View>


        <View style={styles.chart}>
          <Text style={styles.chartTitle}>People Mentioned</Text>
          <BarChart
            data={{
              labels: personLabels,
              datasets: [{data: personData}],
            }}
            yAxisInterval={1}
            fromZero
            showValuesOnTopOfBars
            width={Dimensions.get("window").width - 10} // from react-native
            height={200}
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              fillShadowGradientFrom: "#305DBF",
              fillShadowGradientTo: "#305DBF",
              fillShadowGradientFromOpacity: 1,
              fillShadowGradientToOpacity: 1,
              decimalPlaces: 1, // optional, defaults to 2dp
              color: () => "#305DBF",
              labelColor: () => "gray",
              propsForDots: {r: "5"},
            }}
            verticalLabelRotation={0}
            style={{
              borderRadius: 10,
              paddingRight: 40,
            }}
          />
        </View>


        <View style={styles.chart}>
          <Text style={styles.chartTitle}>Companies Mentioned</Text>
          <BarChart
            data={{
              labels: companyLabels,
              datasets: [{data: companyData}],
            }}
            yAxisInterval={1}
            fromZero
            showValuesOnTopOfBars
            width={Dimensions.get("window").width - 10} // from react-native
            height={200}
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              fillShadowGradientFrom: "#305DBF",
              fillShadowGradientTo: "#305DBF",
              fillShadowGradientFromOpacity: 1,
              fillShadowGradientToOpacity: 1,
              decimalPlaces: 1, // optional, defaults to 2dp
              color: () => "#305DBF",
              labelColor: () => "gray",
              propsForDots: {r: "5"},
            }}
            verticalLabelRotation={0}
            style={{
              borderRadius: 10,
              paddingRight: 40,
            }}
          />
        </View>
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
  chart: {
    backgroundColor: "white",
    borderRadius: 10,
    margin: 5,
    paddingBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "500",
    margin: 5,
    padding: 5,
  },
  sentimentIcon: {
    marginLeft: 10,
  },
  axisTitle: {
    fontSize: 12,
    alignSelf: "center",
    color: "gray",
  }
});