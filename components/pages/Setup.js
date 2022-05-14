import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {apiUrl} from '../api';
import {useSelector} from 'react-redux';
import Loading from './Loading';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';
import PushNotification, {Importance} from 'react-native-push-notification';
import 'moment/locale/fr';

const Setup = ({route, navigation}) => {
  const salon = useSelector(state => state.auth.salon);
  const token = useSelector(state => state.auth.token);
  const [number, setNumber] = useState(1);
  const rv = route.params;
  const [dateData, setDateData] = useState([
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().format('DD')
          : moment().add(1, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().format('MMMM')
          : moment().add(1, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(1, 'days').format('DD')
          : moment().add(2, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(1, 'days').format('MMMM')
          : moment().add(2, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(2, 'days').format('DD')
          : moment().add(3, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(2, 'days').format('MMMM')
          : moment().add(3, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(3, 'days').format('DD')
          : moment().add(4, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(3, 'days').format('MMMM')
          : moment().add(4, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(4, 'days').format('DD')
          : moment().add(5, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(4, 'days').format('MMMM')
          : moment().add(5, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(5, 'days').format('DD')
          : moment().add(6, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(5, 'days').format('MMMM')
          : moment().add(6, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(6, 'days').format('DD')
          : moment().add(7, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(6, 'days').format('MMMM')
          : moment().add(7, 'days').format('MMMM'),
    },
  ]);
  const [dateSelect, setdateSelect] = useState(0);
  const [timeData, settimeData] = useState([]);
  const [isLoadingTime, setisLoadingTime] = useState(true);
  const [dateS, setdateS] = useState('');
  const [sendNot, setsendNot] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  moment.locale('fr');

  useEffect(async () => {
    if (number === 1) {
      setdateSelect(0);
      try {
        const res = await axios.get(
          `${apiUrl}/appointement?salon=${salon._id}&team=${
            rv.team === null ? '' : rv.team._id
          }&date=${new Date(
            moment(
              `${
                parseInt(moment().add(2, 'hours').format('HH')) < 22
                  ? moment().format('YYYY-MM-DD')
                  : moment().add(1, 'days').format('YYYY-MM-DD')
              }`,
            ).format(),
          )}`,
        );

        const timeSlots = [];
        if (salon.gap === 'minute') {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? (22 - parseInt(moment().add(2, 'hours').format('HH'))) * 2
              : 13 * 2;
          let j = 0;
          if (timeSlotsNumber >= 26) {
            for (let i = 0; i < 26; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) === 9 + j &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                      parseInt(
                        moment()
                          .add(2 + j, 'hours')
                          .format('HH'),
                      ) &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          }
        } else {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? 22 - parseInt(moment().add(2, 'hours').format('HH'))
              : 13;
          if (timeSlotsNumber >= 13) {
            for (let i = 0; i < 13; i++) {
              if (
                res.data.find(
                  date => parseInt(moment(date).format('HH')) === 9 + i,
                )
              ) {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: true,
                });
              }
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                    parseInt(
                      moment()
                        .add(2 + i, 'hours')
                        .format('HH'),
                    ),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: true,
                });
              }
            }
          }
        }
        settimeData(timeSlots);
        setisLoadingTime(false);
      } catch (err) {
        setisLoadingTime(false);
      }
    }
  }, [number]);

  useEffect(() => {
    if (sendNot) {
      let Adate = new Date(dateS);
      let NAdate = new Date(Adate.getTime() - 15 * 60 * 1000);
      PushNotification.localNotificationSchedule({
        channelId: 'AfellaSalonNotId',
        title: 'Rappel',
        message:
          rv.team === null
            ? `il ne reste que 15 minutes pour le rendez-vous avec ${rv.client.name}`
            : `il ne reste que 15 minutes pour le rendez-vous de ` +
              rv.team.name +
              ' avec ' +
              rv.client.name,
        actions: ['Plus de détails'],
        date: NAdate,
        data: JSON.stringify({accepted: 'accepted'}),
        allowWhileIdle: true,
        importance: Importance.HIGH,
      });
      setsendNot(false);
    }
  }, [sendNot]);

  const updateAppoint = async () => {
    setisLoading(true);
    try {
      await axios.patch(
        `${apiUrl}/appointement/update_appointement_salon/${rv._id}`,
        {
          status: 'accepted',
          date: dateS,
          client: rv.client,
          salon: rv.salon,
          team: rv.team,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      try {
        await analytics().logEvent('rv_accepted', {
          salon: {id: salon._id, name: salon.name},
          client: {id: rv.client._id, name: rv.client.name},
          date: rv.date,
        });
      } catch (err) {}
      setsendNot(true);
      setTimeout(() => {
        setisLoading(false);
        navigation.navigate('Rendez-vous', {rv: true});
      }, 500);
    } catch (err) {
      setisLoading(false);
    }
  };

  const changeDate = async index => {
    setdateSelect(index);
    setisLoadingTime(true);
    try {
      const res = await axios.get(
        `${apiUrl}/appointement?salon=${salon._id}&team=${
          rv.team === null ? '' : rv.team._id
        }&date=${new Date(
          moment(
            `${
              parseInt(moment().add(2, 'hours').format('HH')) < 22
                ? moment().add(index, 'days').format('YYYY-MM-DD')
                : moment()
                    .add(index + 1, 'days')
                    .format('YYYY-MM-DD')
            }`,
          ).format(),
        )}`,
      );
      if (index === 0) {
        const timeSlots = [];
        if (salon.gap === 'minute') {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? (22 - parseInt(moment().add(2, 'hours').format('HH'))) * 2
              : 13 * 2;
          let j = 0;
          if (timeSlotsNumber >= 26) {
            for (let i = 0; i < 26; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) === 9 + j &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                      parseInt(
                        moment()
                          .add(2 + j, 'hours')
                          .format('HH'),
                      ) &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          }
        } else {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? 22 - parseInt(moment().add(2, 'hours').format('HH'))
              : 13;
          if (timeSlotsNumber >= 13) {
            for (let i = 0; i < 13; i++) {
              if (
                res.data.find(
                  date => parseInt(moment(date).format('HH')) === 9 + i,
                )
              ) {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: true,
                });
              }
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                    parseInt(
                      moment()
                        .add(2 + i, 'hours')
                        .format('HH'),
                    ),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: true,
                });
              }
            }
          }
        }
        settimeData(timeSlots);
        setisLoadingTime(false);
      } else {
        const timeSlots = [];
        if (salon.gap === 'minute') {
          let j = 0;
          for (let i = 0; i < 26; i++) {
            if (
              res.data.find(
                date =>
                  parseInt(moment(date).format('HH')) === 9 + j &&
                  parseInt(moment(date).format('mm')) ===
                    (i % 2 === 0 ? 0 : 30),
              )
            ) {
              timeSlots.push({
                time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                available: false,
              });
            } else {
              timeSlots.push({
                time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                available: true,
              });
            }
            j = i % 2 === 0 ? j : j + 1;
          }
        } else {
          for (let i = 0; i < 13; i++) {
            if (
              res.data.find(
                date => parseInt(moment(date).format('HH')) === 9 + i,
              )
            ) {
              timeSlots.push({
                time: `${9 + i}:00`,
                available: false,
              });
            } else {
              timeSlots.push({
                time: `${9 + i}:00`,
                available: true,
              });
            }
          }
        }
        settimeData(timeSlots);
        setisLoadingTime(false);
      }
    } catch (err) {
      setisLoadingTime(false);
    }
  };

  const handleConfirm = time => {
    const theDate = moment(
      `${
        parseInt(moment().add(2, 'hours').format('HH')) < 22
          ? moment().add(dateSelect, 'days').format('YYYY-MM-DD')
          : moment()
              .add(dateSelect + 1, 'days')
              .format('YYYY-MM-DD')
      } ${time}`,
      'YYYY-MM-DD HH:mm',
    ).format();
    setdateS(new Date(theDate));
    setNumber(2);
  };

  const handleCall = () => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${rv.client.phone}`;
    } else {
      phoneNumber = `telprompt:${rv.client.phone}`;
    }
    Linking.openURL(phoneNumber);
  };

  let code;
  if (number === 1) {
    code = (
      <View
        style={{
          flex: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 40,
          }}>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            1
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'dashed',
              borderColor: '#777',
            }}></View>
          <MaterialCommunityIcons
            name="check-bold"
            color={'#fff'}
            size={22}
            style={{
              backgroundColor: '#777',
              paddingTop: 3,
              paddingLeft: 4,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}
          />
        </View>

        <TouchableOpacity
          style={{
            marginTop: -20,
            marginBottom: 30,
            backgroundColor: '#9b945f',
            paddingHorizontal: 20,
            paddingVertical: 10,
            elevation: 3,
          }}
          onPress={handleCall}>
          <Text
            style={{
              fontSize: 16,
              textAlign: 'center',
              color: '#fff',
            }}>
            Appeler client:{' '}
            <Text
              style={{
                fontWeight: 'bold',
              }}>
              {rv.client.phone}
            </Text>
          </Text>
        </TouchableOpacity>

        <ScrollView
          horizontal={true}
          style={{
            paddingLeft: 10,
          }}>
          {dateData.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: dateSelect === index ? '#216839' : '#ccc',
                marginHorizontal: 3,
                padding: 5,
                borderRadius: 15,
                width: 60,
              }}
              onPress={() => changeDate(index)}>
              <Text
                style={{
                  fontSize: 22,
                  textTransform: 'uppercase',
                  color: dateSelect === index ? '#fff' : '#216839',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                {date.day}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  textTransform: 'uppercase',
                  color: dateSelect === index ? '#fff' : '#216839',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                {date.month}
              </Text>
            </TouchableOpacity>
          ))}
          <View
            style={{
              width: 20,
            }}></View>
        </ScrollView>

        {isLoadingTime ? (
          <ActivityIndicator
            style={{
              marginVertical: 100,
            }}
            size="large"
            color="#222"
          />
        ) : (
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: 20,
            }}>
            {timeData.map((time, index) => (
              <TouchableOpacity
                key={index}
                disabled={!time.available}
                style={{
                  backgroundColor: time.available ? '#fff' : '#ddd',
                  margin: 5,
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                  borderColor: '#aaa',
                  borderWidth: 2,
                  borderStyle: time.available ? 'dotted' : 'solid',
                  borderRadius: 10,
                  width: 70,
                }}
                onPress={() => handleConfirm(time.time)}>
                <Text
                  style={{
                    fontSize: 18,
                    textTransform: 'uppercase',
                    color: time.available ? '#333' : '#999',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  {time.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  } else if (number === 2) {
    code = (
      <View
        style={{
          flex: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 15,
          }}>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            1
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'solid',
              borderColor: '#216839',
            }}></View>
          <MaterialCommunityIcons
            name="check-bold"
            color={'#fff'}
            size={22}
            style={{
              backgroundColor: '#216839',
              paddingTop: 3,
              paddingLeft: 4,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}
          />
        </View>
        <View
          style={{
            flex: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            marginHorizontal: 20,
            marginVertical: 60,
            alignSelf: 'center',
            backgroundColor: '#fff',
            elevation: 3,
            borderRadius: 20,
            width: '90%',
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

          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#777',
              marginTop: 30,
            }}>
            {rv.coiff.name}
          </Text>
          <Text
            style={{
              color: '#000',
              marginTop: 10,
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Client: {rv.client.name}
          </Text>
          {rv.team !== null && (
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              Coiffeur: {rv.team.name}
            </Text>
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
              {moment(dateS).calendar()}
            </Text>
          </View>

          <View
            style={{
              flex: 0,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                margin: 20,
                backgroundColor: '#216839',
                borderRadius: 10,
                elevation: 2,
              }}
              onPress={updateAppoint}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView>
          <Text style={{fontSize: 18, textAlign: 'center', marginTop: 50}}>
            Changez votre rendez-vous avec:
          </Text>
          <Text
            style={{
              fontSize: 24,
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            {rv.client.name}
          </Text>
          <MaterialCommunityIcons
            style={{
              position: 'absolute',
              padding: 2,
              left: 10,
              top: 7,
            }}
            onPress={() => navigation.goBack()}
            name="window-close"
            color={'black'}
            size={30}
          />
          {code}
        </ScrollView>
      )}
    </>
  );
};

export default Setup;
