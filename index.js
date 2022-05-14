/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  PushNotification.localNotification({
    channelId: 'AfellaSalonNotId',
    title: remoteMessage.data.title,
    message: remoteMessage.data.message,
    actions: remoteMessage.data.actions,
    data: remoteMessage.data.handle,
  });

  try {
    let handle = JSON.parse(remoteMessage.data.handle);
    let Adate = new Date(handle.date);
    let NAdate = new Date(Adate.getTime() - 15 * 60 * 1000);

    if (handle.hasOwnProperty('accepted')) {
      PushNotification.localNotificationSchedule({
        channelId: 'AfellaSalonNotId',
        title: 'Rappel',
        message:
          handle.team === null
            ? `il ne reste que 15 minutes pour le rendez-vous avec ${handle.client}`
            : `il ne reste que 15 minutes pour le rendez-vous de ` +
              handle.team +
              ' avec ' +
              handle.client,
        actions: ['Plus de détails'],
        date: NAdate,
        data: remoteMessage.data.handle,
        allowWhileIdle: true,
        importance: Importance.HIGH,
      });
    }
  } catch (err) {}
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
