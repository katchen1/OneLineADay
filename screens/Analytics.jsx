import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import ViewShot from "react-native-view-shot";
import { auth, db } from "../firebaseConfig";


class AnalyticsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.state = { user: {}, isLoading : true };
    this.viewShotRef = React.createRef();
  }

  // Take screenshot of the charts and share it
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

  // Get sentiment distribution
  getSentimentDistribution = () => {
    let positiveCount = 0, neutralCount = 0, negativeCount = 0;
    this.state.user.entries.forEach(function(entry) {
      if (entry["sentimentScore"] > 0) positiveCount += 1;
      else if (entry["sentimentScore"] == 0) neutralCount += 1;
      else if (entry["sentimentScore"] < 0) negativeCount += 1;
    }); 
    let output = [
      {name: "Positive", freq: positiveCount, color: "green", legendFontColor: "gray", legendFontSize: 16},
      {name: "Neutral", freq: neutralCount, color: "#305DBF", legendFontColor: "gray", legendFontSize: 16},
      {name: "Negative", freq: negativeCount, color: "red", legendFontColor: "gray", legendFontSize: 16},
    ]
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
    this.navigation.navigate("Chart Details", {title: "Sentiment Trend", data: sentimentData});
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

  sentimentDistributionOnPress = () => {
    let dist = this.getSentimentDistribution();
    let sentimentCounts = [["Positive", dist[0].freq], ["Neutral", dist[1].freq], ["Negative", dist[2].freq]];
    this.navigation.navigate("Chart Details", {title: "Sentiment", data: sentimentCounts});
  }

  // Line chart for sentiment trend
  SentimentChartRender = ({ labels, data, range }) => {
    return <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Sentiment Trend</Text>
        <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={this.sentimentOnPress} />
      </View>
      <Ionicons style={styles.sentimentIcon} name="happy" size={20} color="green" />
      <LineChart
        data={{
          labels: labels,
          datasets: [{data: data}, { data: [-1 * range, range], color: () => 'transparent'} ]
        }}
        width={Dimensions.get("window").width - 10} // from react-native
        height={200}
        padding={10}
        chartConfig={styles.sentimentChartConfig}
        bezier
        style={styles.chart}
      />
      <Ionicons style={styles.sentimentIcon} name="sad" size={20} color="red" />
      <Text style={styles.chartAxisText}>Days Ago</Text>
    </View>
  }

  // Bar charts for places/people/companies mentioned
  BarChartRender = ({ labels, data, tag, onPress }) => {
    return <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{tag} Mentioned</Text>
        <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={onPress} />
      </View>
      <BarChart
        data={{ labels: labels, datasets: [{data: data}] }}
        yAxisInterval={1}
        fromZero
        showValuesOnTopOfBars
        width={Dimensions.get("window").width - 10} // from react-native
        height={200}
        chartConfig={styles.barChartConfig}
        verticalLabelRotation={0}
        style={styles.chart}
      />
    </View>
  }

  // Pie chart for sentiment distribution
  PieChartRender = ({ data }) => {
    return <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Sentiment Distribution</Text>
       <Ionicons style={styles.moreIcon} name="list" size={28} color="gray" onPress={this.sentimentDistributionOnPress} />
      </View>
      <PieChart
        data={data}
        height={200}
        width={Dimensions.get("window").width - 10}
        accessor={"freq"}
        chartConfig={styles.pieChartConfig}
        backgroundColor={"transparent"}
        center={[20, 0]}
      />
    </View>
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

    // Pie chart
    let pieChartData = this.getSentimentDistribution();

    // Bar charts
    let entityCounts = this.getNamedEntities();
    for (tag in entityCounts) { // Show only top 5 counts
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
        <ViewShot ref={this.viewShotRef} options={{format: "jpg", quality: 0.9}}>
          <this.SentimentChartRender labels={lineChartLabels} data={lineChartData} range={range} />
          <this.PieChartRender data={pieChartData} onPress={this.companiesOnPress} />
          <this.BarChartRender labels={locationLabels} data={locationData} tag={"Places"} onPress={this.placesOnPress} />
          <this.BarChartRender labels={personLabels} data={personData} tag={"People"} onPress={this.peopleOnPress} />
          <this.BarChartRender labels={companyLabels} data={companyData} tag={"Companies"} onPress={this.companiesOnPress} />
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
  barChartConfig: {
    backgroundGradientFrom: "white",
    backgroundGradientTo: "white",
    color: () => "#305DBF",
    decimalPlaces: 1, // optional, defaults to 2dp
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 1,
    labelColor: () => "gray",
  },
  chart: {
    borderRadius: 10,
    paddingRight: 40,
  },
  chartAxisText: {
    alignSelf: "center",
    color: "gray",
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    margin: 5,
    paddingBottom: 10,
  },
  chartHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "500",
    margin: 5,
    padding: 5,
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  moreIcon: {
    alignSelf: "center",
  },
  pieChartConfig: {
    color: () => "white",
  },
  scrollView: {
    height: "100%",
  },
  sentimentChartConfig: {
    backgroundGradientFrom: "white",
    backgroundGradientTo: "white",
    color: () => "#305DBF",
    decimalPlaces: 0, // optional, defaults to 2dp
    fillShadowGradientFromOpacity: 0,
    fillShadowGradientToOpacity: 0,
  },
  sentimentIcon: {
    marginLeft: 10,
  },
  shareButton: {
    marginRight: 10,
  },
});