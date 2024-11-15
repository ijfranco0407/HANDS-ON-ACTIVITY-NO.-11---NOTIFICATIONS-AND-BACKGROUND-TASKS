import React, { useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';


const BACKGROUND_FETCH_TASK = 'background-fetch-task';

export default function App() {
  
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission not granted for notifications');
      } else {
        console.log('Notification permissions granted!');
      }
    };
    requestPermissions();

    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  
  useEffect(() => {
    const registerBackgroundTask = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 15 * 60, 
          stopOnTerminate: false, 
          startOnBoot: true, 
        });
        console.log('Background task registered');
      } catch (err) {
        console.log('Error registering background task:', err);
      }
    };

    registerBackgroundTask();
  }, []);

  
  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got a new message!",
        body: 'Check your inbox.',
        data: { screen: 'MessageScreen' },
      },
      trigger: { seconds: 3 },
    });
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data.screen;
        Alert.alert(`Navigating to: ${screen}`);
      }
    );
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>NOTIFICATIONS AND BACKGROUND TASKS Demo</Text>
      <Button title="Send Notification" onPress={scheduleNotification} />
    </View>
  );
}


TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background fetch task executed');
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.log('Error in background fetch task:', error);
    return BackgroundFetch.Result.Failed;
  }
});
