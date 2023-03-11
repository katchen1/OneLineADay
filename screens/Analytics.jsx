import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import ViewShot from "react-native-view-shot";
import { auth, db } from "../firebaseConfig";


class AnalyticsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, isLoading : true };
    this.viewShotRef = React.createRef();
  }

  shareOnPress = () => {
    this.viewShotRef.current.capture().then((uri) => {
      Sharing.shareAsync("file://" + uri);
    }), (error) => console.error("Oops, snapshot failed", error);
  };

  // Get sentiment for showing trend
  getSentimentForChart = () => {
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

  // Get all sentiment data
  getSentiment = () => {
    let output = [];
    this.state.user.entries.forEach(function(entry) {
      output.push([entry["date"], entry["sentimentScore"]]);
    });
    // Sort by reverse date
    output.sort(function compare(a, b) {
      return a[0] < b[0]? 1: (a[0] > b[0]? -1: 0); 
    });
    // Date to string
    for (let i = 0; i < output.length; i++) {
      let date = moment(output[i][0]);
      output[i][0] = date.format("LL");
      output[i].push(date.fromNow());
    }
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
    for (tag in entityCounts) {
      // Convert object to array of key-value pairs
      entityCounts[tag] = Object.keys(entityCounts[tag]).map(function(word) {
        return [word, entityCounts[tag][word]];
      });
      // Sort by count decreasing
      entityCounts[tag].sort(function compare(a, b) {
        return a[1] < b[1]? 1: (a[1] > b[1]? -1: 0);
      });
    }
    return entityCounts;
  }
  
  // Query user data
  queryUser = async (user) => {
    this.userRef = doc(db, "users", user.uid);
    let docSnap = await getDoc(this.userRef);
    if (docSnap.exists) {
      let user = docSnap.data();
      this.setState({ user: user, isLoading: false });
    }
  }

  sentimentOnPress = () => {
    let sentimentData = this.getSentiment();
    this.navigation.navigate("Chart Details", {title: "Sentiment", data: sentimentData});
  }

  placesOnPress = () => {
    let entityCounts = this.getNamedEntities();
    this.navigation.navigate("Chart Details", {title: "Places", data: entityCounts["location"]});
  }

  peopleOnPress = () => {
    let entityCounts = this.getNamedEntities();
    this.navigation.navigate("Chart Details", {title: "People", data: entityCounts["person"]});
  }

  companiesOnPress = () => {
    let entityCounts = this.getNamedEntities();
    this.navigation.navigate("Chart Details", {title: "Companies", data: entityCounts["company"]});
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
    let daysAgoToSentiment = this.getSentimentForChart();
    let lineChartLabels = [...Object.keys(daysAgoToSentiment)].reverse(); 
    let lineChartData = [...Object.values(daysAgoToSentiment)].reverse();
    let range = Math.max(Math.abs(Math.min(...lineChartData)), Math.abs(Math.max(...lineChartData)));

    // Bar charts
    let entityCounts = this.getNamedEntities();
    for (tag in entityCounts) {
      entityCounts[tag] = entityCounts[tag].slice(0, 5);
    }
    let personLabels = entityCounts["person"].map((elem) => elem[0]);
    let personData = entityCounts["person"].map((elem) => elem[1]);
    let locationLabels = entityCounts["location"].map((elem) => elem[0]);
    let locationData = entityCounts["location"].map((elem) => elem[1]);
    let companyLabels = entityCounts["company"].map((elem) => elem[0]);
    let companyData = entityCounts["company"].map((elem) => elem[1]);

    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ViewShot
          style={styles.container}
          ref={this.viewShotRef}
          options={{format: 'jpg', quality: 0.9}}
        >
          <View style={styles.chart}>
            <View style={styles.header}>
              <Text style={styles.chartTitle}>Sentiment Trend</Text>
              <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={this.sentimentOnPress} />
            </View>
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
            <View style={styles.header}>
              <Text style={styles.chartTitle}>Places Mentioned</Text>
              <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={this.placesOnPress} />
            </View>
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
            <View style={styles.header}>
              <Text style={styles.chartTitle}>People Mentioned</Text>
              <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={this.peopleOnPress} />
            </View>
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
            <View style={styles.header}>
              <Text style={styles.chartTitle}>Companies Mentioned</Text>
              <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={this.companiesOnPress} />
            </View> 
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
        </ViewShot>
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
  },
  moreIcon: {
    alignSelf: "center",
  }
});