import React from 'react';
import {View, Image} from 'react-native';
import logo_afella from '../public/logo-afella.png';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({navigation}) => {
  return (
    <View
      style={{
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        borderBottom: 1,
        paddingVertical: 12,
        backgroundColor: '#fff',
      }}>
      {/*<Ionicons
        style={{
          position: 'absolute',
          paddingTop: 12,
          paddingLeft: 15,
          alignSelf: 'flex-start',
        }}
        onPress={() => {
          navigation.openDrawer();
        }}
        name="menu"
        color={'#aaa'}
        size={32}
      />*/}
      <Image
        style={{
          width: '30%',
          height: 35,
          resizeMode: 'contain',
          alignSelf: 'center',
        }}
        source={logo_afella}
      />
    </View>
  );
};

export default Header;
