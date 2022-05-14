import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {apiUrl} from './api';
import Footer from './Footer';
import Setup from './pages/Setup';
import Appointment from './pages/Appointment';
import Auth from './pages/Auth';
import AddCoif from './pages/AddCoif';
import AddTarif from './pages/AddTarif';
import AddPost from './pages/AddPost';
import AddRv from './pages/AddRv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {dispatchGetSalon} from '../redux/actions/authAction';
import {dispatchSetNot} from '../redux/actions/notAction';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';
import Loading from './pages/Loading';
import Cashback from './pages/Cashback';
import QrPage from './pages/QrPage';
import Jobs from './pages/Jobs';
import AddJob from './pages/AddJob';
import Likes from './pages/Likes';
import SplashScreen from 'react-native-splash-screen';

const Stack = createNativeStackNavigator();

const Nav = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setisLoading] = useState(true);
  const [isLoadingF, setisLoadingF] = useState(false);
  const [rvParam, setrvParam] = useState(false);
  useEffect(() => {
    const getLogin = async () => {
      SplashScreen.hide();
      const firstLogin = await AsyncStorage.getItem('firstLogin');
      if (JSON.parse(firstLogin)) {
        try {
          const res = await axios.post(`${apiUrl}/salon/refresh_token`, null);
          dispatch(dispatchGetSalon(res));
          setisLoading(false);
        } catch (err) {
          await AsyncStorage.removeItem('firstLogin');
          setisLoading(false);
        }
      } else {
        setisLoading(false);
      }
    };
    getLogin();
  }, [dispatch]);

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
      }
    }
    requestUserPermission();
  }, []);

  useEffect(() => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        dispatch(dispatchSetNot(token.token));
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        if (notification.userInteraction) {
          setisLoadingF(true);
          if (notification.data.hasOwnProperty('accepted')) {
            setrvParam(true);
          } else if (notification.data.hasOwnProperty('waiting')) {
            setrvParam(false);
          }

          setTimeout(() => {
            setisLoadingF(false);
          }, 500);
        }

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        //notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {},

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

    PushNotification.createChannel({
      channelId: 'AfellaSalonNotId', // (required)
      channelName: 'AfellaSalon', // (required)
      channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
    });

    const push = (title, message, actions) => {
      PushNotification.localNotification({
        channelId: 'AfellaSalonNotId',
        title,
        message,
        actions,
      });
    };
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      push(
        remoteMessage.data.title,
        remoteMessage.data.message,
        JSON.parse(remoteMessage.data.actions),
      );
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#eee" barStyle="dark-content" />
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {isLoadingF ? (
            <Loading />
          ) : (
            <Stack.Navigator
              initialRouteName={auth.token !== '' ? 'Footer' : 'Auth'}>
              <Stack.Screen
                options={{headerShown: false}}
                name="Footer"
                component={Footer}
                initialParams={{rv: rvParam}}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Setup"
                component={Setup}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Appointment"
                component={Appointment}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Auth"
                component={Auth}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="AddCoif"
                component={AddCoif}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="AddTarif"
                component={AddTarif}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="AddPost"
                component={AddPost}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="AddRv"
                component={AddRv}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Cashback"
                component={Cashback}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="QrPage"
                component={QrPage}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Jobs"
                component={Jobs}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="AddJob"
                component={AddJob}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Likes"
                component={Likes}
              />
            </Stack.Navigator>
          )}
        </>
      )}
    </>
  );
};

export default Nav;
