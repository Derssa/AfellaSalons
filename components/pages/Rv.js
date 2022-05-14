import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  ToastAndroid,
} from 'react-native';
import axios from 'axios';
import {apiUrl} from '../api';
import Header from '../Header';
import moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import {Picker} from '@react-native-picker/picker';
import {useDispatch, useSelector} from 'react-redux';
import {dispatchUpdateSalon} from '../../redux/actions/authAction';
import 'moment/locale/fr';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PushNotification, {Importance} from 'react-native-push-notification';
import analytics from '@react-native-firebase/analytics';
import {useIsFocused} from '@react-navigation/native';

const Rv = ({route, navigation}) => {
  const {salon, token} = useSelector(state => state.auth);
  const [rvList, setrvList] = useState([]);
  const [rvListAccepted, setrvListAccepted] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [favToggle, setfavToggle] = useState(false);
  const [newRv, setnewRv] = useState(false);
  const [sendNot, setsendNot] = useState(false);
  const [chosenRv, setchosenRv] = useState({});
  const [isRefresh, setisRefresh] = useState(false);
  const [page, setpage] = useState(1);
  const [stopRefresh, setstopRefresh] = useState(false);
  const [selectedGap, setSelectedGap] = useState(
    useSelector(state => state.auth.salon.gap),
  );
  const [isLoadingGap, setisLoadingGap] = useState(false);
  const {rv} = route.params;
  const isFocused = useIsFocused();

  moment.locale('fr');

  const dispatch = useDispatch();

  useEffect(() => {
    messaging().onMessage(rm => {
      setnewRv(!newRv);
    });
  }, []);

  useEffect(() => {
    if (isFocused) {
      if (rv) {
        showAccepted();
      } else {
        fetchRv();
      }
    }
  }, [newRv, isFocused]);

  useEffect(() => {
    if (sendNot) {
      let Adate = new Date(chosenRv.date);
      let NAdate = new Date(Adate.getTime() - 15 * 60 * 1000);
      PushNotification.localNotificationSchedule({
        channelId: 'AfellaSalonNotId',
        title: 'Rappel',
        message:
          chosenRv.team === null
            ? `il ne reste que 15 minutes pour le rendez-vous avec ${chosenRv.client.name}`
            : `il ne reste que 15 minutes pour le rendez-vous de ` +
              chosenRv.team.name +
              ' avec ' +
              chosenRv.client.name,
        actions: ['Plus de détails'],
        date: NAdate,
        data: JSON.stringify({accepted: 'accepted'}),
        allowWhileIdle: true,
        importance: Importance.HIGH,
      });
      setchosenRv({});
      setsendNot(false);
    }
  }, [sendNot]);

  const fetchRv = async () => {
    setfavToggle(false);
    try {
      const res = await axios.get(`${apiUrl}/salon/rv_waiting?page=1`, {
        headers: {
          Authorization: token,
        },
      });
      setrvList(res.data);
      setisLoading(false);
      setpage(1);
      setstopRefresh(false);
      setisRefresh(false);
    } catch (err) {}
  };

  const showWaiting = async () => {
    setfavToggle(false);
    setisLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/salon/rv_waiting?page=1`, {
        headers: {
          Authorization: token,
        },
      });
      setrvList(res.data);
      setisLoading(false);
      setpage(1);
      setstopRefresh(false);
      setisRefresh(false);
    } catch (err) {}
  };

  const showAccepted = async () => {
    setfavToggle(true);
    setisLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/salon/rv_accepted?page=1`, {
        headers: {
          Authorization: token,
        },
      });
      setrvListAccepted(res.data);
      setisLoading(false);
      setpage(1);
      setstopRefresh(false);
      setisRefresh(false);
    } catch (err) {}
  };

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

        setchosenRv(rv);
        setsendNot(true);
        showAccepted();
      } catch (err) {}
    }
  };

  const handleDelete = async rv => {
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

              showWaiting();
            } catch (err) {}
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

  const changeGap = async item => {
    try {
      setisLoadingGap(true);

      const res = await axios.patch(
        `${apiUrl}/salon/update_gap`,
        {
          gap: item,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      dispatch(dispatchUpdateSalon(res));

      setSelectedGap(item);
      setisLoadingGap(false);
    } catch (err) {
      setisLoadingGap(false);
    }
  };

  const loadMoreAccepted = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/salon/rv_accepted?page=${page + 1}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (res.data.length) {
          setrvListAccepted([...rvListAccepted, ...res.data]);
          setpage(page + 1);
        } else {
          setstopRefresh(true);
        }

        setisRefresh(false);
      } catch (err) {
        setisRefresh(false);
      }
    }
  };

  const loadMoreWaiting = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/salon/rv_waiting?page=${page + 1}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (res.data.length) {
          setrvList([...rvList, ...res.data]);
          setpage(page + 1);
        } else {
          setstopRefresh(true);
        }

        setisRefresh(false);
      } catch (err) {
        setisRefresh(false);
      }
    }
  };

  const rvWaitingItem = useCallback(({item}) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => {
          navigation.navigate('Appointment', item);
        }}
        style={{
          margin: 10,
          backgroundColor: '#fff',
          borderRadius: 15,
          elevation: 5,
          minHeight: 70,
          zIndex: -1,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}>
          <View
            style={{
              width: '80%',
              paddingLeft: 10,
              justifyContent: 'space-around',
              paddingVertical: 7,
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                color: '#aaa',
              }}>
              N°: {item._id}
            </Text>
            {item.hasOwnProperty('client') && (
              <Text
                numberOfLines={1}
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: '#9b945f',
                }}>
                De {item.client.name}
              </Text>
            )}

            <Text
              numberOfLines={1}
              style={{
                fontWeight: 'bold',
                fontSize: 16,
                color: '#444',
              }}>
              Avec {item.team === null ? 'vous' : item.team.name}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                textAlign: 'justify',
              }}>
              {moment(item.date).calendar()}
            </Text>
          </View>
          <View
            style={{
              width: '20%',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <MaterialCommunityIcons
              style={{
                marginRight: 5,
              }}
              name="timer-sand"
              color={'#C17112'}
              size={34}
            />
          </View>
        </View>
        {item.status === 'waiting salon' && (
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                marginHorizontal: 14,
                backgroundColor: '#216839',
                borderRadius: 5,
                marginTop: 5,
                marginBottom: 10,
              }}
              onPress={() => handleAccepted(item)}>
              <Text
                style={{
                  fontSize: 14,
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
                marginHorizontal: 14,
                backgroundColor: '#9b945f',
                borderRadius: 5,
                marginTop: 5,
                marginBottom: 10,
              }}
              onPress={() => navigation.navigate('Setup', item)}>
              <Text
                style={{
                  fontSize: 14,
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
                marginHorizontal: 14,
                backgroundColor: '#b73531',
                borderRadius: 5,
                marginTop: 5,
                marginBottom: 10,
              }}
              onPress={() => handleDelete(item)}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }, []);

  const rvAcceptedItem = useCallback(({item}) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => navigation.navigate('Appointment', item)}
        style={{
          margin: 10,
          backgroundColor: '#fff',
          borderRadius: 15,
          elevation: 5,
          minHeight: 70,
          zIndex: -1,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}>
          <View
            style={{
              width: '80%',
              paddingLeft: 10,
              justifyContent: 'space-around',
              paddingVertical: 7,
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                color: '#aaa',
              }}>
              N°: {item._id}
            </Text>
            {item.hasOwnProperty('client') ? (
              <Text
                numberOfLines={1}
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: '#9b945f',
                }}>
                De {item.client.name}
              </Text>
            ) : (
              <Text
                numberOfLines={1}
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: '#9b945f',
                }}>
                De {item.customClient}
              </Text>
            )}

            <Text
              numberOfLines={1}
              style={{
                fontWeight: 'bold',
                fontSize: 16,
                color: '#444',
              }}>
              Avec {item.team === null ? 'vous' : item.team.name}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                textAlign: 'justify',
              }}>
              {moment(item.date).calendar()}
            </Text>
          </View>
          <View
            style={{
              width: '20%',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <MaterialCommunityIcons
              style={{
                marginRight: 5,
              }}
              name="check"
              color={'#137522'}
              size={34}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback(item => item._id, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <Header navigation={navigation} />
      <View
        style={{
          margin: 10,
          flex: 0,
          height: 50,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            if (salon.coiff.length > 0) {
              navigation.navigate('AddRv');
            } else {
              ToastAndroid.show('Ajouter tarif', ToastAndroid.LONG);
            }
          }}
          style={{
            backgroundColor: '#216839',
            elevation: 5,
          }}>
          <Text
            style={{
              color: '#fff',
              paddingHorizontal: 15,
              paddingVertical: 12,
            }}>
            + Ajouter rendez-vous
          </Text>
        </TouchableOpacity>
        {isLoadingGap ? (
          <ActivityIndicator
            size="large"
            color="#222"
            style={{
              marginRight: 60,
            }}
          />
        ) : (
          <View
            style={{
              backgroundColor: '#ddd',
              borderRadius: 10,
              width: 140,
            }}>
            <Picker
              selectedValue={selectedGap}
              onValueChange={(itemValue, itemIndex) => changeGap(itemValue)}>
              <Picker.Item
                style={{
                  fontSize: 13,
                }}
                label="30 min"
                value="minute"
              />
              <Picker.Item
                style={{
                  fontSize: 13,
                }}
                label="1 heure"
                value="hour"
              />
            </Picker>
          </View>
        )}
      </View>
      <View
        style={{
          paddingVertical: 10,
          flex: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={showWaiting}
          style={{
            flex: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialCommunityIcons
            style={{
              marginHorizontal: 35,
            }}
            name="calendar-clock"
            color={favToggle ? '#aaa' : '#9b945f'}
            size={favToggle ? 30 : 35}
          />
          <Text
            style={{
              marginTop: 3,
              fontSize: favToggle ? 10 : 12,
              color: favToggle ? '#666' : '#9b945f',
              fontWeight: favToggle ? 'normal' : 'bold',
            }}>
            En Attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={showAccepted}
          style={{
            flex: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialCommunityIcons
            style={{
              marginHorizontal: 35,
            }}
            name="calendar-check"
            color={favToggle ? '#9b945f' : '#aaa'}
            size={favToggle ? 35 : 30}
          />
          <Text
            style={{
              marginTop: 3,
              fontSize: favToggle ? 12 : 10,
              color: favToggle ? '#9b945f' : '#666',
              fontWeight: favToggle ? 'bold' : 'normal',
            }}>
            Accepter
          </Text>
        </TouchableOpacity>
      </View>
      {!favToggle ? (
        <>
          {isLoading ? (
            <ActivityIndicator
              style={{marginTop: 20}}
              size="large"
              color="#222"
            />
          ) : rvList.length > 0 ? (
            <FlatList
              data={rvList}
              renderItem={rvWaitingItem}
              keyExtractor={keyExtractor}
              ListFooterComponent={
                isRefresh && (
                  <ActivityIndicator
                    style={{marginBottom: 20, marginTop: 10}}
                    size="large"
                    color="#222"
                  />
                )
              }
              onEndReached={loadMoreWaiting}
              onEndReachedThreshold={0}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={12}
            />
          ) : (
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ccc',
                textTransform: 'uppercase',
                marginTop: 15,
                fontSize: 18,
              }}>
              Pas de rendez-vous
            </Text>
          )}
        </>
      ) : (
        <>
          {isLoading ? (
            <ActivityIndicator
              style={{marginTop: 20}}
              size="large"
              color="#222"
            />
          ) : rvListAccepted.length > 0 ? (
            <FlatList
              data={rvListAccepted}
              renderItem={rvAcceptedItem}
              keyExtractor={keyExtractor}
              ListFooterComponent={
                isRefresh && (
                  <ActivityIndicator
                    style={{marginBottom: 20, marginTop: 10}}
                    size="large"
                    color="#222"
                  />
                )
              }
              onEndReached={loadMoreAccepted}
              onEndReachedThreshold={0}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={12}
            />
          ) : (
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ccc',
                textTransform: 'uppercase',
                marginTop: 15,
                fontSize: 18,
              }}>
              Pas de rendez-vous
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default Rv;
