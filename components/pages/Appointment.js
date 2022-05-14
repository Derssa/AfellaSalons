import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import Loading from './Loading';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/fr';
import {apiUrl} from '../api';
import PushNotification, {Importance} from 'react-native-push-notification';
import analytics from '@react-native-firebase/analytics';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Appointment = ({route, navigation}) => {
  const token = useSelector(state => state.auth.token);
  const rv = route.params;
  const [isLoading, setisLoading] = useState(false);
  const [sendNot, setsendNot] = useState(false);
  moment.locale('fr');

  useEffect(() => {
    if (sendNot) {
      let Adate = new Date(rv.date);
      let NAdate = new Date(Adate.getTime() - 15 * 60 * 1000);
      PushNotification.localNotificationSchedule({
        channelId: 'AfellaSalonNotId',
        title: rv.client.name,
        message:
          rv.team === null
            ? `il ne reste que 15 minutes pour le rendez-vous avec ${rv.client.name}`
            : `il ne reste que 15 minutes pour le rendez-vous de ` +
              rv.team.name +
              ' avec ' +
              rv.client.name,
        actions: ['Plus de details'],
        date: NAdate,
        data: JSON.stringify({accepted: 'accepted'}),
        allowWhileIdle: true,
        importance: Importance.HIGH,
      });
      setisLoading(false);
      setsendNot(false);
      navigation.navigate('Rendez-vous', {rv: true});
    }
  }, [sendNot]);

  const handleAccepted = async rv => {
    if (rv.client.isValide === 'true') {
      setisLoading(true);
      try {
        await axios.patch(
          `${apiUrl}/appointement/update_appointement_salon/${rv._id}`,
          {
            date: rv.date,
            client: rv.client,
            salon: rv.salon,
            team: rv.team,
            status: 'accepted',
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        try {
          await analytics().logEvent('rv_accepted', {
            salon: {id: rv.salon._id, name: rv.salon.name},
            client: {id: rv.client._id, name: rv.client.name},
            date: rv.date,
          });
        } catch (err) {}

        setsendNot(true);
      } catch (err) {
        setisLoading(false);
      }
    }
  };

  const handleDelete = rv => {
    Alert.alert(
      `Annulation de rendez-vous`,
      `Vous voulez vraiment annuler votre rendez-vous avec ${rv.client.name}?`,
      [
        {
          text: 'Oui',
          onPress: async () => {
            setisLoading(true);
            try {
              await axios.delete(
                `${apiUrl}/appointement/delete_appointement/${rv._id}`,
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
              try {
                await analytics().logEvent('rv_deleted', {
                  salon: {id: rv.salon._id, name: rv.salon.name},
                  client: {id: rv.client._id, name: rv.client.name},
                  date: rv.date,
                });
              } catch (err) {}

              setisLoading(false);
              navigation.goBack();
            } catch (err) {
              setisLoading(false);
            }
          },
        },
        {
          text: 'Non',
          onPress: () => {},
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ScrollView>
            <View
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                marginTop: 70,
                marginBottom: 10,
                marginHorizontal: 20,
                alignSelf: 'center',
                backgroundColor: '#fff',
                elevation: 3,
                borderRadius: 20,
                height: 510,
                width: '95%',
                position: 'relative',
              }}>
              <Text
                style={{
                  fontSize: 24,
                }}>
                Ticket rendez-vous
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#888',
                }}>
                N°:{rv._id}
              </Text>
              <Image
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  margin: 20,
                  overlayColor: '#fff',
                }}
                source={
                  rv.salon.avatar === ''
                    ? DefaultAvatar
                    : {
                        uri: rv.salon.avatar,
                      }
                }
              />
              <Text
                style={{
                  color: '#9b945f',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}>
                {rv.salon.name}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#888',
                  marginBottom: 20,
                }}>
                Pour {rv.salon.gender}
              </Text>
              {rv.coiff !== null && (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#777',
                    }}>
                    {rv.coiff.name}
                  </Text>
                </View>
              )}
              {rv.team !== null && (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}>
                    Avec:{'  '}
                  </Text>

                  <Text
                    style={{
                      fontSize: 18,
                    }}>
                    {rv.team.name}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}>
                  Client:{'  '}
                </Text>
                {rv.hasOwnProperty('client') ? (
                  <Text
                    style={{
                      fontSize: 18,
                    }}>
                    {rv.client.name}
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontSize: 18,
                    }}>
                    {rv.customClient}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}>
                  {moment(rv.date).calendar()}
                </Text>
              </View>

              {rv.status === 'accepted' && (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <MaterialCommunityIcons
                    style={{
                      marginRight: 5,
                      marginTop: 18,
                    }}
                    onPress={() => {}}
                    name="check"
                    color={'#137522'}
                    size={34}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#137522',
                      textTransform: 'uppercase',
                      marginTop: 20,
                      fontSize: 20,
                    }}>
                    Accepter
                  </Text>
                </View>
              )}
              {rv.status === 'waiting salon' && (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                  }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      marginVertical: 20,
                      marginHorizontal: 10,
                      backgroundColor: '#216839',
                      borderRadius: 10,
                      elevation: 2,
                    }}
                    onPress={() => handleAccepted(rv)}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                      Accepter
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      marginVertical: 20,
                      marginHorizontal: 10,
                      backgroundColor: '#9b945f',
                      borderRadius: 10,
                      elevation: 2,
                    }}
                    onPress={() => navigation.navigate('Setup', rv)}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                      Changer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      marginVertical: 20,
                      marginHorizontal: 10,
                      backgroundColor: '#b73531',
                      borderRadius: 10,
                      elevation: 2,
                    }}
                    onPress={() => handleDelete(rv)}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
          <MaterialCommunityIcons
            style={{
              position: 'absolute',
              padding: 2,
              backgroundColor: '#ebebeb',
              borderRadius: 20,
              margin: 15,
            }}
            onPress={() =>
              navigation.navigate('Rendez-vous', {
                rv: rv.status === 'accepted' ? true : false,
              })
            }
            name="window-close"
            color={'black'}
            size={30}
          />
        </>
      )}
    </>
  );
};

export default Appointment;
