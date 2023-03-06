import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function NotificationsSettingsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState([12, 0]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const { data } = await getDoc(userRef);
        switch (data.notificationsEnabled) {
          case undefined:
            await updateDoc(userRef, "notificationsEnabled", true);
            setNotificationsEnabled(true);
            break;
          case true:
            setNotificationsEnabled(true);
            break;
          case false:
            setNotificationsEnabled(false);
            break;
        }
      } catch (error) {
        console.error(error);
        return;
      }

      const storedNotificationTime = await AsyncStorage.getItem(
        "notificationTime"
      );
      if (storedNotificationTime === null) {
        await AsyncStorage.setItem("notificationTime", JSON.stringify([12, 0]));
        setNotificationTime([12, 0]);
      } else {
        setNotificationTime(JSON.parse(storedNotificationTime));
      }

      setIsLoading(false);
    })();
  }, []);

  async function toggleNotifications() {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, "notificationsEnabled", !notificationsEnabled);
      setNotificationsEnabled(!notificationsEnabled);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTimePickerChange(_event, selectedTime) {
    await AsyncStorage.setItem(
      "notificationTime",
      JSON.stringify([selectedTime.getHours(), selectedTime.getMinutes()])
    );
    setShowTimePicker(false);
    setNotificationTime([selectedTime.getHours(), selectedTime.getMinutes()]);
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <View className="flex h-16 flex-row items-center justify-between bg-white px-4">
        <Text className="text-lg">Daily journal reminders</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
      <Pressable
        className="flex h-16 flex-row items-center justify-between bg-white px-4"
        onPress={() => setShowTimePicker(true)}
      >
        <Text className="text-lg">Journal reminder time</Text>
        <Text className="text-lg text-gray-500">{`${
          notificationTime[0]
        }:${notificationTime[1].toString().padStart(2, "0")}`}</Text>
      </Pressable>
      {showTimePicker ? (
        <DateTimePicker
          mode="time"
          value={new Date(2000, 0, 1, notificationTime[0], notificationTime[1])}
          onChange={handleTimePickerChange}
        />
      ) : null}
    </>
  );
}
