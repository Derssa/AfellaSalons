import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Header from '../Header';
import {launchImageLibrary} from 'react-native-image-picker';
import {apiUrl} from '../api';
import axios from 'axios';
import {Picker} from '@react-native-picker/picker';
import {useDispatch, useSelector} from 'react-redux';
import {dispatchUpdateSalon} from '../../redux/actions/authAction';
import Geolocation from 'react-native-geolocation-service';
import Loading from './Loading';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Salon = ({navigation}) => {
  const salon = useSelector(state => state.auth.salon);
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const [selectedGender, setSelectedGender] = useState(salon.gender);
  const [homeMenu, setHomeMenu] = useState(0);
  const [modifiedSalon, setmodifiedSalon] = useState({
    name: '',
    avatar: '',
    businessPhone: '',
    description: '',
  });
  const [err, setErr] = useState('');
  const [isdisabled, setisdisabled] = useState(true);
  const [isLoading, setisLoading] = useState(false);
  const [location, setlocation] = useState(salon.location);
  const [image, setimage] = useState({});

  useEffect(() => {
    setmodifiedSalon({
      name: salon.name,
      avatar: salon.avatar,
      businessPhone: salon.businessPhone,
      description: salon.description,
    });
    setisdisabled(true);
  }, [homeMenu]);

  const getPermission = async () => {
    if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          Geolocation.getCurrentPosition(
            position => {
              dispatch(
                dispatchUpdateLocation([
                  position.coords.latitude,
                  position.coords.longitude,
                ]),
              );
            },
            error => {},
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }
      } catch (err) {}
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              console.log([
                position.coords.latitude,
                position.coords.longitude,
              ]);
              setlocation([
                position.coords.latitude,
                position.coords.longitude,
              ]);
              setisdisabled(false);
            },
            error => {},
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }
      } catch (err) {}
    }
  };

  const handleChange = (text, from) => {
    setErr('');
    setisdisabled(false);
    setmodifiedSalon({...modifiedSalon, [from]: text});
  };

  const getBlob = async fileUri => {
    const res = await fetch(fileUri);
    const imageBody = await res.blob();
    return imageBody;
  };

  const handleSubmit = async () => {
    setisLoading(true);
    if (modifiedSalon.name === '' || selectedGender === '') {
      setErr('Nom est obligatoire');
      setisLoading(false);
      return;
    }

    let imageUrl = '';

    if (modifiedSalon.avatar !== salon.avatar) {
      try {
        const res = await axios.get(
          `${apiUrl}/upload_salon_avatar?type=${image.type.replace(
            'image/',
            '',
          )}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        const imageBody = await getBlob(image.uri);

        await fetch(res.data.uploadUrl, {method: 'PUT', body: imageBody});

        imageUrl = res.data.imageUrl;
      } catch (error) {
        setErr(err.response.data.msg);
        setisLoading(false);
        return;
      }
    }

    try {
      const res = await axios.patch(
        `${apiUrl}/salon/update_info`,
        {
          name: modifiedSalon.name,
          gender: selectedGender,
          businessPhone: modifiedSalon.businessPhone,
          description: modifiedSalon.description,
          avatar: imageUrl === '' ? salon.avatar : imageUrl,
          location: location,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      dispatch(dispatchUpdateSalon(res));
      setisdisabled(true);
      setisLoading(false);
    } catch (err) {
      setErr(err.response.data.msg);
      setisLoading(false);
    }
  };

  const deleteTeam = coiffeur => {
    Alert.alert(
      'Supprimer ' + coiffeur.name,
      'Vous voulez vraiment supprimer ' + coiffeur.name,
      [
        {
          text: 'Oui',
          onPress: async () => {
            setisLoading(true);
            try {
              const res = await axios.delete(
                `${apiUrl}/team/delete_team/${coiffeur._id}`,
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
              dispatch(dispatchUpdateSalon(res));
              setisLoading(false);
            } catch (err) {
              setErr(err.response.data.msg);
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

  const deleteCoiff = coiff => {
    Alert.alert(
      'Supprimer ' + coiff.name,
      'Vous voulez vraiment supprimer ' + coiff.name,
      [
        {
          text: 'Oui',
          onPress: async () => {
            setisLoading(true);
            try {
              const res = await axios.delete(
                `${apiUrl}/coiff/delete_coiff/${coiff._id}`,
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
              dispatch(dispatchUpdateSalon(res));
              setisLoading(false);
            } catch (err) {
              ToastAndroid.show(err.response.data.msg, ToastAndroid.LONG);
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

  const testLocation = () => {
    const url = `https://www.google.com/maps?q=${location[0]},${location[1]}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => {});
  };

  return (
    <>
      <Header navigation={navigation} />
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <View
            style={{
              paddingVertical: 10,
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                setHomeMenu(0);
              }}
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                style={{
                  marginHorizontal: 30,
                }}
                name="home"
                color={homeMenu != 0 ? '#aaa' : '#9b945f'}
                size={homeMenu != 0 ? 30 : 35}
              />
              <Text
                style={{
                  marginTop: 3,
                  fontSize: homeMenu != 0 ? 10 : 12,
                  color: homeMenu != 0 ? '#666' : '#9b945f',
                  fontWeight: homeMenu != 0 ? 'normal' : 'bold',
                }}>
                Salon
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setHomeMenu(1);
              }}
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                style={{
                  marginHorizontal: 30,
                }}
                name="account-group"
                color={homeMenu === 1 ? '#9b945f' : '#aaa'}
                size={homeMenu === 1 ? 35 : 30}
              />
              <Text
                style={{
                  marginTop: 3,
                  fontSize: homeMenu === 1 ? 12 : 10,
                  color: homeMenu === 1 ? '#9b945f' : '#666',
                  fontWeight: homeMenu === 1 ? 'bold' : 'normal',
                }}>
                Equipe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setHomeMenu(2);
              }}
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Entypo
                style={{
                  marginHorizontal: 30,
                }}
                name="scissors"
                color={homeMenu === 2 ? '#9b945f' : '#aaa'}
                size={homeMenu === 2 ? 35 : 30}
              />
              <Text
                style={{
                  marginTop: 3,
                  fontSize: homeMenu === 2 ? 12 : 10,
                  color: homeMenu === 2 ? '#9b945f' : '#666',
                  fontWeight: homeMenu === 2 ? 'bold' : 'normal',
                }}>
                Tarifs
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {homeMenu === 0 && (
              <>
                <View
                  style={{
                    width: '95%',
                    flex: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      launchImageLibrary({mediaType: 'photo'}, res => {
                        if (res.assets) {
                          if (res.assets[0].fileSize > 1024 * 1024) {
                            setErr('image ne doit pas dépasser 1 mb');
                            return;
                          } // 1mb

                          if (
                            res.assets[0].type !== 'image/jpeg' &&
                            res.assets[0].type !== 'image/png' &&
                            res.assets[0].type !== 'image/gif'
                          ) {
                            setErr('format doit être JPEG, PNG ou GIF');
                            return;
                          }
                          setimage(res.assets[0]);
                          handleChange(res.assets[0].uri, 'avatar');
                        }
                      });
                    }}
                    style={{
                      width: '50%',
                    }}>
                    <Image
                      style={{
                        height: 170,
                        borderRadius: 20,
                        width: '100%',
                        alignSelf: 'flex-start',
                        marginVertical: 10,
                        overlayColor: '#eee',
                      }}
                      source={
                        modifiedSalon.avatar === ''
                          ? salon.avatar === ''
                            ? DefaultAvatar
                            : {uri: salon.avatar}
                          : {uri: modifiedSalon.avatar}
                      }
                    />

                    <MaterialCommunityIcons
                      style={{
                        position: 'absolute',
                        padding: 2,
                        backgroundColor: '#ebebeb',
                        borderRadius: 20,
                        margin: 20,
                        elevation: 5,
                      }}
                      name="image-edit-outline"
                      color={'black'}
                      size={30}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      width: '50%',
                    }}>
                    <TextInput
                      placeholder="Nom du Salon"
                      style={{
                        height: 45,
                        backgroundColor: '#ddd',
                        borderRadius: 10,
                        marginBottom: 10,
                        width: '95%',
                        alignSelf: 'center',
                      }}
                      onChangeText={text => handleChange(text, 'name')}
                      value={modifiedSalon.name}
                    />
                    <TextInput
                      placeholder="Téléphone"
                      keyboardType="phone-pad"
                      style={{
                        height: 45,
                        backgroundColor: '#ddd',
                        borderRadius: 10,
                        marginBottom: 10,
                        width: '95%',
                        alignSelf: 'center',
                      }}
                      onChangeText={text => handleChange(text, 'businessPhone')}
                      value={modifiedSalon.businessPhone}
                    />
                    <View
                      style={{
                        backgroundColor: '#ddd',
                        borderRadius: 10,
                        width: '95%',
                        alignSelf: 'center',
                      }}>
                      <Picker
                        selectedValue={selectedGender}
                        onValueChange={(itemValue, itemIndex) => {
                          setSelectedGender(itemValue);
                          setisdisabled(false);
                        }}>
                        <Picker.Item
                          style={{
                            fontSize: 13,
                          }}
                          label="Pour Femme"
                          value="femme"
                        />
                        <Picker.Item
                          style={{
                            fontSize: 13,
                          }}
                          label="Pour Homme"
                          value="homme"
                        />
                      </Picker>
                    </View>
                  </View>
                </View>
                <TextInput
                  placeholder="Description (Pas Obligatoire)"
                  multiline={true}
                  numberOfLines={4}
                  style={{
                    backgroundColor: '#ddd',
                    borderRadius: 10,
                    marginBottom: 10,
                    width: '95%',
                    alignSelf: 'center',
                    textAlignVertical: 'top',
                    textAlign: 'justify',
                  }}
                  value={modifiedSalon.description}
                  onChangeText={text => handleChange(text, 'description')}
                />
                <View
                  style={{
                    flex: 0,
                    width: '95%',
                    justifyContent: 'space-between',
                    alignSelf: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginBottom: 10,
                  }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#9b945f',
                      alignSelf: 'center',
                      borderRadius: 5,
                      width: '15%',
                      elevation: 3,
                    }}
                    onPress={getPermission}>
                    <Entypo
                      style={{
                        margin: 8,
                        alignSelf: 'center',
                      }}
                      name="location"
                      color={'#fff'}
                      size={25}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      backgroundColor: '#ddd',
                      alignSelf: 'center',
                      borderRadius: 5,
                      width: '60%',
                    }}>
                    <Text
                      style={{
                        padding: 10,
                        fontSize: 16,
                        textAlign: 'center',
                        color: '#666',
                      }}>
                      {location.length === 0
                        ? 'No location'
                        : location[0] + ', ' + location[1]}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={location.length === 0}
                    style={{
                      backgroundColor:
                        location.length === 0 ? '#44444450' : '#444444',
                      alignSelf: 'center',
                      borderRadius: 5,
                      width: '20%',
                    }}
                    onPress={testLocation}>
                    <Text
                      style={{
                        padding: 10,
                        fontSize: 16,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#fff',
                      }}>
                      TEST
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  disabled={isdisabled}
                  style={{
                    marginBottom: 10,
                    backgroundColor: isdisabled ? '#21683950' : '#216839',
                    alignSelf: 'center',
                    borderRadius: 10,
                    width: '95%',
                  }}
                  onPress={handleSubmit}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    Modifier
                  </Text>
                </TouchableOpacity>
                {err !== '' && (
                  <Text
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#E54545',
                      textTransform: 'uppercase',
                      marginVertical: 5,
                    }}>
                    {err}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Likes', {
                      postId: '',
                      like: 'followers',
                    })
                  }
                  style={{
                    flex: 0,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    flexDirection: 'column',
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#666',
                      fontSize: 18,
                    }}>
                    Followers
                  </Text>
                  <View
                    style={{
                      flex: 0,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MaterialCommunityIcons
                      name="heart"
                      color={'#b73535'}
                      size={34}
                    />
                    <Text
                      style={{
                        color: '#444',
                        fontSize: 22,
                        fontWeight: 'bold',
                        marginLeft: 5,
                      }}>
                      {salon.favCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
            {homeMenu === 1 && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('AddCoif');
                  }}
                  style={{
                    marginVertical: 15,
                    backgroundColor: '#fff',
                    borderWidth: 2,
                    borderColor: '#9b945f',
                    alignSelf: 'center',
                    borderRadius: 10,
                    elevation: 5,
                    width: '90%',
                  }}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#9b945f',
                    }}>
                    + Ajouter Equipe
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    marginVertical: 5,
                  }}>
                  {salon.team.length ? (
                    salon.team.map(coiffeur => (
                      <View
                        key={coiffeur._id}
                        style={{
                          backgroundColor: '#fff',
                          padding: 10,
                          elevation: 5,
                          borderRadius: 10,
                          width: '95%',
                          borderWidth: 2,
                          borderColor: '#bbb',
                          position: 'relative',
                          marginVertical: 5,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            marginBottom: 5,
                          }}>
                          {coiffeur.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#999',
                          }}>
                          {coiffeur.speciality}
                        </Text>
                        <MaterialCommunityIcons
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: 14,
                          }}
                          onPress={() => deleteTeam(coiffeur)}
                          name="close"
                          color={'#b73531'}
                          size={30}
                        />
                      </View>
                    ))
                  ) : (
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#ccc',
                        textTransform: 'uppercase',
                        marginTop: 5,
                        fontSize: 18,
                      }}>
                      Pas de coiffeur
                    </Text>
                  )}
                </View>
              </>
            )}
            {homeMenu === 2 && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('AddTarif');
                  }}
                  style={{
                    marginVertical: 15,
                    backgroundColor: '#fff',
                    borderWidth: 2,
                    borderColor: '#9b945f',
                    alignSelf: 'center',
                    borderRadius: 10,
                    elevation: 5,
                    width: '90%',
                  }}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#9b945f',
                    }}>
                    + Ajouter Tarif
                  </Text>
                </TouchableOpacity>
                {salon.coiff.length ? (
                  salon.coiff.map(coiff => (
                    <View
                      key={coiff._id}
                      style={{
                        flex: 0,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        marginVertical: 5,
                      }}>
                      <View
                        style={{
                          backgroundColor: '#fff',
                          padding: 10,
                          elevation: 5,
                          borderRadius: 10,
                          width: '95%',
                          borderWidth: 2,
                          borderColor: '#bbb',
                          position: 'relative',
                          marginVertical: 5,
                        }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            marginBottom: 5,
                          }}>
                          {coiff.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#9b945f',
                            fontWeight: 'bold',
                          }}>
                          {coiff.price === '' ? '' : coiff.price + ' DH'}
                        </Text>
                        <MaterialCommunityIcons
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: 15,
                          }}
                          onPress={() => deleteCoiff(coiff)}
                          name="close"
                          color={'#b73531'}
                          size={30}
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <Text
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#ccc',
                      textTransform: 'uppercase',
                      marginTop: 5,
                      fontSize: 18,
                    }}>
                    Pas de tarif
                  </Text>
                )}
              </>
            )}
          </ScrollView>
        </>
      )}
    </>
  );
};

export default Salon;
