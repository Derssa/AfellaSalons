import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Posts from './pages/Posts';
import Rv from './pages/Rv';
import Salon from './pages/Salon';
import inAppMessaging from '@react-native-firebase/in-app-messaging';

const Tab = createBottomTabNavigator();

const Footer = ({route}) => {
  const {rv} = route.params;

  useEffect(async () => {
    await inAppMessaging().setMessagesDisplaySuppressed(true);
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Rendez-vous"
      screenOptions={{
        tabBarActiveTintColor: '#9b945f',
      }}>
      <Tab.Screen
        name="Mon Salon"
        component={Salon}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="home-edit" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Rendez-vous"
        component={Rv}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="calendar-multiple"
              color={color}
              size={25}
            />
          ),
        }}
        initialParams={{rv}}
      />
      <Tab.Screen
        name="Posts"
        component={Posts}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="post" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Footer;
