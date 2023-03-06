import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { LogBox } from "react-native";
import colors from "tailwindcss/colors";
import { auth } from "./firebaseConfig";
import AnalyticsScreen from "./screens/Analytics";
import FriendActivityScreen from "./screens/FriendActivity";
import HomeScreen from "./screens/Home";
import NewEntryScreen from "./screens/NewEntry";
import NotificationsSettingsScreen from "./screens/NotificationsSettings";
import SettingsScreen from "./screens/Settings";
import SignInScreen from "./screens/SignIn";
import SignUpScreen from "./screens/SignUp";

LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [userIsSignedIn, setUserIsSignedIn] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUserIsSignedIn(Boolean(user));
    });
  }, []);

  if (!userIsSignedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Sign In">
          <Stack.Screen name="Sign In" component={SignInScreen} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  const HomeStack = () => {
    return (
      <Stack.Navigator initialRouteName="Home Screen">
        <Stack.Screen name="Home Screen" component={HomeScreen} />
        <Stack.Screen name="New Entry" component={NewEntryScreen} />
      </Stack.Navigator>
    );
  };

  const SettingsStack = () => {
    return (
      <Stack.Navigator initialRouteName="Settings">
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="Notifications"
          component={NotificationsSettingsScreen}
        />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const color = focused ? colors.blue[700] : colors.gray[500];
            const size = 32;

            switch (route.name) {
              case "Home":
                return <Ionicons name="home" color={color} size={size} />;
              case "Analytics":
                return <Ionicons name="analytics" color={color} size={size} />;
              case "Friend Activity":
                return <Ionicons name="people" color={color} size={size} />;
              case "Settings Tab":
                return <Ionicons name="settings" color={color} size={size} />;
            }
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.gray[100],
            height: 64,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Friend Activity" component={FriendActivityScreen} />
        <Tab.Screen
          name="Settings Tab"
          component={SettingsStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
