import React, {useEffect} from 'react';
import {ImageBackground, View, Text} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import qrLogo from '../../public/qrLogo.png';
import bg from '../../public/background.jpg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import messaging from '@react-native-firebase/messaging';

const QrPage = ({route, navigation}) => {
  const {transaction} = route.params;

  useEffect(() => {
    messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data.hasOwnProperty('cash')) {
        navigation.navigate('Cashback');
      }
    });
  }, []);

  return (
    <ImageBackground
      source={bg}
      style={{
        flex: 1,
        resizeMode: 'cover',
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginVertical: 70,
        }}>
        <View
          style={{
            alignItems: 'center',
          }}>
          <Text
            style={{
              marginBottom: -5,
              fontSize: 28,
              color: '#9b945f',
              fontFamily: 'Painting_With_Chocolate',
            }}>
            CA$HBACK
          </Text>
          <Text
            style={{
              fontSize: 35,
              color: '#333',
              fontFamily: 'Painting_With_Chocolate',
            }}>
            <Text
              style={{
                color: transaction.type === 'plus' ? '#216839' : '#333',
              }}>
              {transaction.type === 'plus' ? '+' : '-'}
              {transaction.price}
            </Text>
            DH
          </Text>
        </View>
        <QRCode
          value={transaction._id}
          size={200}
          logo={qrLogo}
          logoSize={40}
          logoBackgroundColor="transparent"
          backgroundColor={'#ffffff00'}
        />
        <Text
          style={{
            fontSize: 25,
            color: '#333',
            fontWeight: 'bold',
            textAlign: 'center',
            width: '90%',
          }}>
          Donner au client le{' '}
          <Text
            style={{
              color: '#9b945f',
            }}>
            QrCode
          </Text>{' '}
          pour le scanner
        </Text>
      </View>
      <MaterialCommunityIcons
        style={{
          position: 'absolute',
          padding: 2,
          backgroundColor: '#ebebeb',
          borderRadius: 20,
          margin: 15,
        }}
        onPress={() => navigation.navigate('Cashback')}
        name="window-close"
        color={'black'}
        size={30}
      />
    </ImageBackground>
  );
};

export default QrPage;
