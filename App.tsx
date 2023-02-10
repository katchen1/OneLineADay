import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import AnalyticsScreen from "./screens/Analytics";
import FriendActivityScreen from "./screens/FriendActivity";
import HomeScreen from "./screens/Home";
import SettingsScreen from "./screens/Settings";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            switch (route.name) {
              case "Home":
                return <Ionicons name="home" size={size} color={color} />;
              case "Analytics":
                return <Ionicons name="analytics" size={size} color={color} />;
              case "Friend Activity":
                return <Ionicons name="people" size={size} color={color} />;
              case "Settings":
                return <Ionicons name="settings" size={size} color={color} />;
            }
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Friend Activity" component={FriendActivityScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
