import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { LogBox } from "react-native";
import colors from "tailwindcss/colors";
import { auth } from "./firebaseConfig";
import AnalyticsScreen from "./screens/Analytics";
import ChangePasswordScreen from "./screens/ChangePassword";
import DeleteAccountScreen from "./screens/DeleteAccount";
import FriendActivityScreen from "./screens/FriendActivity";
import HomeScreen from "./screens/Home";
import NewEntryScreen from "./screens/NewEntry";
import NotificationsSettingsScreen from "./screens/NotificationsSettings";
import SettingsScreen from "./screens/Settings";
import SignInScreen from "./screens/SignIn";
import SignUpScreen from "./screens/SignUp";

LogBox.ignoreAllLogs();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [userIsSignedIn, setUserIsSignedIn] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
        <Stack.Screen name="Change Password" component={ChangePasswordScreen} />
        <Stack.Screen name="Delete Account" component={DeleteAccountScreen} />
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
