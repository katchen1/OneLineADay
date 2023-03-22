import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: "white",
      height: 70,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 5,
      marginHorizontal: 12,
      marginTop: 12,
      marginBottom: 15,
      borderRadius: 10,
    },
    time_picker: {
      backgroundColor: showTimePicker ? "white" : "transparent",
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 5,
      marginHorizontal: 12,
      marginTop: 8,
      marginBottom: 10,
      borderRadius: 10,
    },
    text: {
      fontSize: 20,
      color: "#263238",
      paddingLeft: 8,
      flex: 8,
    },
    date_text: {
      fontSize: 20,
      paddingRight: 20,
    },
    time_picker_text: {
      fontSize: 20,
      color: "transparent",
      paddingLeft: 8,
      flex: 8,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>Daily journal reminders</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
      <Pressable style={styles.container} onPress={handleTimePickerOpen}>
        <Text style={styles.text}>Reset reminder time</Text>
        <Text
          className="text-gray-500"
          style={styles.date_text}
        >{`${notificationTime.getHours()}:${notificationTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`}</Text>
      </Pressable>
      <View style={styles.time_picker}>
        {showTimePicker ? (
          <>
            <Text style={styles.time_picker_text}>Click to reset</Text>
            <DateTimePicker
              mode="time"
              value={notificationTime}
              onChange={handleTimePickerChange}
            />
          </>
        ) : null}
      </View>
    </>
  );
} //className="text-lg text-gray-500"
