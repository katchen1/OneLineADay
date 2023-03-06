import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function NotificationsSettingsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
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
    </>
  );
}
