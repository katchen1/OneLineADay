import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

class ChartDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.title = props.route.params.title;
    this.data = props.route.params.data; // e.g., [["Bob", 3], ["Alice", 2], ["Mary", 1], ...]
  }

  // Invoked immediately after the component is mounted
  async componentDidMount() {
    this.navigation.setOptions({ title: this.title });
  }

  ItemRender = ({ item }) => {
    return (
      <View>
        <View style={styles.item}>
          <View>
            <Text style={styles.wordText}>{item[0]}</Text>
            {this.title == "Sentiment Trend" ? (
              <Text style={styles.agoText}>{item[2]}</Text>
            ) : (
              <View />
            )}
          </View>
          <Text style={styles.countText}>{item[1]}</Text>
        </View>
      </View>
    );
  };

  ItemDivider = () => {
    return <View style={styles.divider} />;
  };

  render() {
    return (
      <View>
        <View style={styles.item}>
          {this.title == "Sentiment Trend" ? (
            <Text>Date</Text>
          ) : (
            <Text>{this.title}</Text>
          )}
          {this.title == "Sentiment Trend" ? (
            <Text>Sentiment</Text>
          ) : (
            <Text>Count</Text>
          )}
        </View>
        <this.ItemDivider />
        <FlatList
          data={this.data}
          renderItem={({ item }) => <this.ItemRender item={item} />}
          keyExtractor={(item) => item[0]}
          ItemSeparatorComponent={this.ItemDivider}
        />
      </View>
    );
  }
}

export default function (props) {
  const navigation = useNavigation();
  return <ChartDetailsScreen {...props} navigation={navigation} />;
}

// Style sheet
const styles = StyleSheet.create({
  agoText: {
    color: "gray",
    fontSize: 16,
    fontFamily: "Raleway_300Light",
  },
  countText: {
    alignSelf: "center",
    fontSize: 20,
    fontFamily: "Raleway_500Medium",
  },
  divider: {
    alignSelf: "center",
    backgroundColor: "gray",
    height: 1,
    width: "90%",
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  wordText: {
    fontSize: 20,
    fontFamily: "Raleway_500Medium",
  },
});
