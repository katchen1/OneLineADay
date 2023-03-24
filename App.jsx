import {
  Raleway_100Thin,
  Raleway_100Thin_Italic,
  Raleway_200ExtraLight,
  Raleway_200ExtraLight_Italic,
  Raleway_300Light,
  Raleway_300Light_Italic,
  Raleway_400Regular,
  Raleway_400Regular_Italic,
  Raleway_500Medium,
  Raleway_500Medium_Italic,
  Raleway_600SemiBold,
  Raleway_600SemiBold_Italic,
  Raleway_700Bold,
  Raleway_700Bold_Italic,
  Raleway_800ExtraBold,
  Raleway_800ExtraBold_Italic,
  Raleway_900Black,
  Raleway_900Black_Italic,
  useFonts,
} from "@expo-google-fonts/raleway";
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
import ChangeNameScreen from "./screens/ChangeName";
import ChangePasswordScreen from "./screens/ChangePassword";
import ChartDetailsScreen from "./screens/ChartDetails";
import DeleteAccountScreen from "./screens/DeleteAccount";
import FriendActivityScreen from "./screens/FriendActivity";
import FriendsScreen from "./screens/Friends";
import HomeScreen from "./screens/Home";
import NewEntryScreen from "./screens/NewEntry";
import NotificationsSettingsScreen from "./screens/NotificationsSettings";
import SettingsScreen from "./screens/Settings";
import SignInScreen from "./screens/SignIn";
import SignUpScreen from "./screens/SignUp";
import VisibilitySettingsScreen from "./screens/VisibilitySettings";

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
  const [fontsLoaded] = useFonts({
    Raleway_100Thin,
    Raleway_100Thin_Italic,
    Raleway_200ExtraLight,
    Raleway_200ExtraLight_Italic,
    Raleway_300Light,
    Raleway_300Light_Italic,
    Raleway_400Regular,
    Raleway_400Regular_Italic,
    Raleway_500Medium,
    Raleway_500Medium_Italic,
    Raleway_600SemiBold,
    Raleway_600SemiBold_Italic,
    Raleway_700Bold,
    Raleway_700Bold_Italic,
    Raleway_800ExtraBold,
    Raleway_800ExtraBold_Italic,
    Raleway_900Black,
    Raleway_900Black_Italic,
  });

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

  if (!fontsLoaded) return null;

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
        <Stack.Screen
          name="Visibility Settings"
          component={VisibilitySettingsScreen}
        />
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
        <Stack.Screen name="Change Name" component={ChangeNameScreen} />
      </Stack.Navigator>
    );
  };

  const AnalyticsStack = () => {
    return (
      <Stack.Navigator initialRouteName="Analytics">
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Chart Details" component={ChartDetailsScreen} />
      </Stack.Navigator>
    );
  };

  const SocialStack = () => {
    return (
      <Stack.Navigator initialRouteName="Friend Activity">
        <Stack.Screen name="Friend Activity" component={FriendActivityScreen} />
        <Stack.Screen name="Friends" component={FriendsScreen} />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const color = focused ? "#305DBF" : "gray";
            const size = 32;

            switch (route.name) {
              case "Home":
                return <Ionicons name="home" color={color} size={size} />;
              case "Analytics Stack":
                return <Ionicons name="analytics" color={color} size={size} />;
              case "Social Stack":
                return <Ionicons name="people" color={color} size={size} />;
              case "Settings Tab":
                return <Ionicons name="settings" color={color} size={size} />;
            }
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.gray[100],
            height: 80,
          },
          unmountOnBlur: true,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Analytics Stack"
          component={AnalyticsStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Social Stack"
          component={SocialStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Settings Tab"
          component={SettingsStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
