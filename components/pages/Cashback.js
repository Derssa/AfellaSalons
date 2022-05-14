import React, {useState, useEffect, useCallback} from 'react';
import {
  ImageBackground,
  Text,
  View,
  FlatList,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import bg from '../../public/background.jpg';
import {useSelector, useDispatch} from 'react-redux';
import {apiUrl} from '../api';
import axios from 'axios';
import {dispatchUpdateSalon} from '../../redux/actions/authAction';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loading from './Loading';
import analytics from '@react-native-firebase/analytics';
import {useIsFocused} from '@react-navigation/native';

const Cashback = ({navigation}) => {
  const {salon, token} = useSelector(state => state.auth);
  const [solde, setsolde] = useState(salon.cashBack);
  const [err, setErr] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [isLoadingCash, setisLoadingCash] = useState(false);
  const [isEnabled, setIsEnabled] = useState(solde > 0 ? true : false);
  const [isPlus, setisPlus] = useState(false);
  const [isMinus, setisMinus] = useState(false);
  const [floss, setfloss] = useState(0);
  const [wallets, setwallets] = useState([]);
  const [isLoadingW, setisLoadingW] = useState(false);
  const isFocused = useIsFocused();
  const [isRefresh, setisRefresh] = useState(false);
  const [stopRefresh, setstopRefresh] = useState(false);
  const [page, setpage] = useState(1);

  const dispatch = useDispatch();

  useEffect(async () => {
    if (isFocused) {
      setisLoadingW(true);
      try {
        const res = await axios.get(`${apiUrl}/salon/wallets?page=1`, {
          headers: {
            Authorization: token,
          },
        });
        setpage(1);
        setstopRefresh(false);
        setisRefresh(false);
        setwallets(res.data.wallets);
        setisLoadingW(false);
        setisMinus(false);
        setisPlus(false);
        setfloss(0);
      } catch (err) {
        setisRefresh(false);
        setisLoadingW(false);
        setisMinus(false);
        setisPlus(false);
        setfloss(0);
      }
    }
  }, [isFocused]);

  const loadMore = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/salon/wallets?page=${page + 1}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (res.data.wallets.length) {
          setjobList([...wallets, ...res.data.wallets]);
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

  const walletItem = useCallback(
    ({item}) => {
      return (
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 10,
            marginVertical: 10,
            width: '95%',
            borderWidth: 2,
            borderColor: '#9b945f',
            borderStyle: 'dotted',
          }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              alignItems: 'center',
              width: '60%',
            }}>
            <Ionicons
              style={{
                marginRight: 5,
              }}
              name="wallet"
              color={'#777'}
              size={22}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
              }}>
              {item.client.name}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#9b945f',
              fontWeight: 'bold',
            }}>
            {item.money.toFixed(2) + ' ' + 'DH'}
          </Text>
        </View>
      );
    },
    [wallets],
  );

  const keyExtractor = useCallback(item => item._id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 70,
      offset: 70 * index,
      index,
    }),
    [],
  );

  const updateCashback = async () => {
    setisLoadingCash(true);
    setisMinus(false);
    setisPlus(false);
    setfloss(0);
    if (!isEnabled) {
      if (solde.toString() === '' || solde.toString() === '0') {
        setErr('Remplire le pourcentage');
        setisLoadingCash(false);
        return;
      }
      try {
        const res = await axios.patch(
          `${apiUrl}/salon/update_cashback`,
          {
            solde,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        dispatch(dispatchUpdateSalon(res));
        setIsEnabled(true);
        setisLoadingCash(false);
      } catch (err) {
        setErr(err.response.data.msg);
        setisLoadingCash(false);
      }
    } else {
      try {
        const res = await axios.patch(
          `${apiUrl}/salon/update_cashback`,
          {
            solde: 0,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        dispatch(dispatchUpdateSalon(res));
        setsolde(0);
        setIsEnabled(false);
        setisLoadingCash(false);
      } catch (err) {
        setErr(err.response.data.msg);
        setisLoadingCash(false);
      }
    }
  };

  const addTransaction = async type => {
    if (salon.isValide === 'true') {
      setisLoading(true);
      try {
        const res = await axios.post(
          `${apiUrl}/salon/addtransaction`,
          {
            type,
            price:
              type === 'plus'
                ? (floss * (solde / 100)).toFixed(2)
                : floss.toFixed(2),
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        try {
          await analytics().logEvent('qr_generated', {
            salon: {id: salon._id, name: salon.name},
            type,
            price:
              type === 'plus'
                ? (floss * (solde / 100)).toFixed(2)
                : floss.toFixed(2),
          });
        } catch (err) {}
        setTimeout(() => {
          setisLoading(false);
        }, 1000);
        navigation.navigate('QrPage', {transaction: res.data.transaction});
      } catch (err) {
        setisLoading(false);
      }
    } else {
      ToastAndroid.show(
        'Attendez la validation de votre compte',
        ToastAndroid.LONG,
      );
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <ImageBackground
          source={bg}
          style={{
            flex: 1,
            resizeMode: 'cover',
          }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 15,
              marginHorizontal: 15,
            }}>
            <MaterialCommunityIcons
              style={{
                borderRadius: 20,
                zIndex: 1,
              }}
              onPress={() => navigation.goBack()}
              name="window-close"
              color={'black'}
              size={30}
            />
            <Text
              numberOfLines={1}
              style={{
                marginTop: 5,
                fontSize: 28,
                color: '#333',
                fontFamily: 'Painting_With_Chocolate',
              }}>
              CA$HBACK
            </Text>
            {isLoadingCash ? (
              <ActivityIndicator
                size="large"
                color="#222"
                style={{
                  marginRight: 11,
                }}
              />
            ) : (
              <Switch
                trackColor={{false: '#777', true: '#216839'}}
                thumbColor={isEnabled ? '#e1e1e1' : '#ccc'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={updateCashback}
                value={isEnabled}
              />
            )}
          </View>
          {err !== '' && (
            <Text
              style={{
                textAlign: 'center',
                color: '#b73531',
                fontWeight: 'bold',
              }}>
              {err}
            </Text>
          )}
          {!isPlus && !isMinus && (
            <View
              style={{
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 15,
                marginBottom: 5,
                marginHorizontal: 15,
              }}>
              <TextInput
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 20,
                  color: !isEnabled ? '#216839' : '#777',
                  backgroundColor: !isEnabled ? '#e5e5e5' : '#ccc',
                  borderRadius: 10,
                  width: 80,
                  alignSelf: 'center',
                }}
                editable={!isEnabled}
                maxLength={2}
                keyboardType="number-pad"
                onChangeText={text => {
                  setErr('');
                  setsolde(text.replace(/[^0-9]/g, ''));
                }}
                value={solde.toString()}
              />
              <Text
                style={{
                  fontWeight: 'bold',
                  color: isEnabled ? '#222' : '#999',
                  fontSize: 26,
                  marginLeft: 5,
                }}>
                %
              </Text>
              <TouchableOpacity
                disabled={!isEnabled}
                style={{
                  backgroundColor: isEnabled ? '#216839' : '#21683950',
                  alignSelf: 'center',
                  borderRadius: 10,
                  marginLeft: 25,
                  width: 60,
                }}
                onPress={() => {
                  setisPlus(true);
                }}>
                <Text
                  style={{
                    padding: 10,
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#fff',
                  }}>
                  +
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#C17112',
                  alignSelf: 'center',
                  borderRadius: 10,
                  marginLeft: 10,
                  width: 60,
                }}
                onPress={() => {
                  setisMinus(true);
                }}>
                <Text
                  style={{
                    padding: 10,
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#fff',
                  }}>
                  -
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isPlus && (
            <>
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 15,
                  marginBottom: 5,
                  marginHorizontal: 15,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#222',
                    fontSize: 20,
                    marginRight: 5,
                  }}>
                  +
                </Text>
                <TextInput
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: '#216839',
                    backgroundColor: '#e5e5e5',
                    borderRadius: 10,
                    width: 90,
                    alignSelf: 'center',
                  }}
                  keyboardType="number-pad"
                  autoFocus={true}
                  maxLength={8}
                  onChangeText={text => {
                    setErr('');
                    setfloss(text.replace(/[^0-9]/g, ''));
                  }}
                  value={floss.toString()}
                />
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#222',
                    fontSize: 18,
                    marginLeft: 5,
                  }}>
                  DH
                </Text>
                <TouchableOpacity
                  disabled={floss === '0' || floss === '' || floss === 0}
                  style={{
                    backgroundColor: floss > 0 ? '#9b945f' : '#9b945f50',
                    alignSelf: 'center',
                    borderRadius: 10,
                    marginLeft: 10,
                    width: 80,
                  }}
                  onPress={() => addTransaction('plus')}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 18,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    QR
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#b73531',
                    alignSelf: 'center',
                    borderRadius: 10,
                    marginLeft: 10,
                  }}
                  onPress={() => {
                    setisPlus(false);
                    setfloss(0);
                  }}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 18,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#333',
                  fontWeight: 'bold',
                }}>
                écrivez combien le client paie et cliquez sur{' '}
                <Text
                  style={{
                    color: '#9b945f',
                  }}>
                  QR
                </Text>
              </Text>
            </>
          )}
          {isMinus && (
            <>
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 15,
                  marginBottom: 5,
                  marginHorizontal: 15,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#222',
                    fontSize: 20,
                    marginRight: 5,
                  }}>
                  -
                </Text>
                <TextInput
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: '#b73531',
                    backgroundColor: '#e5e5e5',
                    borderRadius: 10,
                    width: 90,
                    alignSelf: 'center',
                  }}
                  keyboardType="number-pad"
                  autoFocus={true}
                  maxLength={8}
                  onChangeText={text => {
                    setErr('');
                    setfloss(text.replace(/[^0-9]/g, ''));
                  }}
                  value={floss.toString()}
                />
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#222',
                    fontSize: 18,
                    marginLeft: 5,
                  }}>
                  DH
                </Text>
                <TouchableOpacity
                  disabled={floss === '0' || floss === '' || floss === 0}
                  style={{
                    backgroundColor: floss > 0 ? '#9b945f' : '#9b945f50',
                    alignSelf: 'center',
                    borderRadius: 10,
                    marginLeft: 10,
                    width: 80,
                  }}
                  onPress={() => addTransaction('minus')}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 18,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    QR
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#b73531',
                    alignSelf: 'center',
                    borderRadius: 10,
                    marginLeft: 10,
                  }}
                  onPress={() => {
                    setisMinus(false);
                    setfloss(0);
                  }}>
                  <Text
                    style={{
                      padding: 10,
                      fontSize: 18,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#fff',
                    }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  alignSelf: 'center',
                  textAlign: 'center',
                  color: '#333',
                  fontWeight: 'bold',
                  width: '90%',
                }}>
                écrivez combien de points vous lui retirerez et cliquez sur{' '}
                <Text
                  style={{
                    color: '#9b945f',
                  }}>
                  QR
                </Text>
              </Text>
            </>
          )}
          <Text
            numberOfLines={1}
            style={{
              marginTop: 10,
              fontSize: 18,
              color: '#333',
              marginLeft: 12,
              fontWeight: 'bold',
            }}>
            Portefeuilles:
          </Text>
          {isLoadingW ? (
            <ActivityIndicator
              style={{marginTop: 20}}
              size="large"
              color="#222"
            />
          ) : wallets.length > 0 ? (
            <FlatList
              data={wallets}
              renderItem={walletItem}
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
              onEndReached={loadMore}
              onEndReachedThreshold={0}
              removeClippedSubviews={true}
              maxToRenderPerBatch={14}
              windowSize={16}
              getItemLayout={getItemLayout}
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
              Pas de portefeuille
            </Text>
          )}
        </ImageBackground>
      )}
    </>
  );
};

export default Cashback;
