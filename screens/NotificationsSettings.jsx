import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";

export default function NotificationsSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(null);
  const [notificationTime, setNotificationTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(function () {
    (async function () {
      const storedNotificationsEnabled = await AsyncStorage.getItem(
        "notificationsEnabled"
      );

      if (storedNotificationsEnabled === null) {
        await AsyncStorage.setItem(
          "notificationsEnabled",
          JSON.stringify(false)
        );
        setNotificationsEnabled(false);
        return;
      }

      setNotificationsEnabled(JSON.parse(storedNotificationsEnabled));
    })();

    (async function () {
      const storedNotificationTime = await AsyncStorage.getItem(
        "notificationTime"
      );

      if (storedNotificationTime === null) {
        await AsyncStorage.setItem(
          "notificationTime",
          JSON.stringify(new Date(2000, 0, 1, 12, 0))
        );
        setNotificationTime(new Date(2000, 0, 1, 12, 0));
        return;
      }

      setNotificationTime(new Date(JSON.parse(storedNotificationTime)));
    })();
  }, []);

  useEffect(
    function () {
      (async function () {
        if (notificationsEnabled === null || notificationTime === null) {
          return;
        }

        if (!notificationsEnabled) {
          await Notifications.cancelAllScheduledNotificationsAsync();
          return;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "It's time to journal.",
            body: "Write your daily journal now.",
          },
          trigger: {
            hour: notificationTime.getHours(),
            minute: notificationTime.getMinutes(),
            repeats: true,
          },
        });
      })();
    },
    [notificationsEnabled, notificationTime]
  );

  async function toggleNotifications() {
    await AsyncStorage.setItem(
      "notificationsEnabled",
      JSON.stringify(!notificationsEnabled)
    );
    setNotificationsEnabled(!notificationsEnabled);
  }

  function handleTimePickerOpen() {
    if (!notificationsEnabled) return;

    setShowTimePicker(true);
  }

  async function handleTimePickerChange(_, selectedTime) {
    await AsyncStorage.setItem(
      "notificationTime",
      JSON.stringify(selectedTime)
    );
    setShowTimePicker(false);
    setNotificationTime(selectedTime);
  }

  if (notificationsEnabled === null || notificationTime === null) {
    return null;
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
        onPress={handleTimePickerOpen}
      >
        <Text className="text-lg">Journal reminder time</Text>
        <Text className="text-lg text-gray-500">{`${notificationTime.getHours()}:${notificationTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`}</Text>
      </Pressable>
      {showTimePicker ? (
        <DateTimePicker
          mode="time"
          value={notificationTime}
          onChange={handleTimePickerChange}
        />
      ) : null}
    </>
  );
}
