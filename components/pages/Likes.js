import React, {useState, useEffect, useCallback} from 'react';
import {
  ImageBackground,
  Text,
  View,
  ActivityIndicator,
  Linking,
  FlatList,
  Platform,
} from 'react-native';
import axios from 'axios';
import {apiUrl} from '../api';
import {useSelector} from 'react-redux';
import bg from '../../public/background.jpg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import analytics from '@react-native-firebase/analytics';

const Likes = ({route, navigation}) => {
  const {salon, token} = useSelector(state => state.auth);
  const {like, postId} = route.params;
  const [isLoading, setisLoading] = useState(true);
  const [isRefresh, setisRefresh] = useState(false);
  const [stopRefresh, setstopRefresh] = useState(false);
  const [page, setpage] = useState(1);
  const [list, setList] = useState([]);

  useEffect(() => {
    getLikes();
  }, []);

  const getLikes = async () => {
    setisLoading(true);
    try {
      if (like === 'followers') {
        const res = await axios.get(`${apiUrl}/salon/followers?page=1`, {
          headers: {
            Authorization: token,
          },
        });
        setList(res.data.followers);
        setpage(1);
        setstopRefresh(false);
        setisLoading(false);
        setisRefresh(false);
      } else if (like === 'likes') {
        const res = await axios.get(
          `${apiUrl}/salon/post_likes?id=${postId}&page=1`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        setList(res.data.likes.likes);
        setpage(1);
        setstopRefresh(false);
        setisLoading(false);
        setisRefresh(false);
      }
    } catch (err) {
      setisLoading(false);
      setisRefresh(false);
    }
  };

  const handleCall = async client => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${client.phone}`;
    } else {
      phoneNumber = `telprompt:${client.phone}`;
    }
    try {
      await analytics().logEvent('get_client_number', {
        salon: {id: salon._id, name: salon.name},
        client: {id: client._id, name: client.name},
      });
    } catch (err) {}
    Linking.openURL(phoneNumber);
  };

  const loadMore = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        if (like === 'followers') {
          const res = await axios.get(
            `${apiUrl}/salon/followers?page=${page + 1}`,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          if (res.data.followers.length) {
            setList([...list, ...res.data.followers]);
            setpage(page + 1);
          } else {
            setstopRefresh(true);
          }
          setisRefresh(false);
        } else if (like === 'likes') {
          const res = await axios.get(
            `${apiUrl}/salon/post_likes?id=${postId}&page=${page + 1}`,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          if (res.data.likes.likes.length) {
            setList([...list, ...res.data.likes.likes]);
            setpage(page + 1);
          } else {
            setstopRefresh(true);
          }
          setisRefresh(false);
        }
      } catch (err) {
        setisRefresh(false);
      }
    }
  };

  const listItem = useCallback(
    ({item}) => {
      return (
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 10,
            margin: 10,
            borderWidth: 2,
            borderColor: '#9b945f',
            borderStyle: 'dotted',
          }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'column',
              width: '90%',
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
              }}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons
              onPress={() => handleCall(item)}
              name="phone-forward"
              color={'#216839'}
              size={28}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [list],
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

  return (
    <>
      <ImageBackground
        source={bg}
        style={{
          flex: 1,
          resizeMode: 'cover',
        }}>
        <MaterialCommunityIcons
          style={{
            position: 'absolute',
            padding: 2,
            backgroundColor: '#ebebeb',
            borderRadius: 20,
            margin: 15,
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
            marginTop: 15,
            fontSize: 26,
            color: '#333',
            textAlign: 'center',
            fontFamily: 'Painting_With_Chocolate',
          }}>
          {like === 'likes' ? 'Likes' : 'Followers'}
        </Text>
        {isLoading ? (
          <ActivityIndicator
            style={{marginTop: 20}}
            size="large"
            color="#222"
          />
        ) : list.length > 0 ? (
          <FlatList
            data={list}
            renderItem={listItem}
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
            {like === 'likes' ? 'Pas de Likes' : 'Pas de Followers'}
          </Text>
        )}
      </ImageBackground>
    </>
  );
};

export default Likes;
