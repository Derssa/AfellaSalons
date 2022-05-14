import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Header from '../Header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {apiUrl} from '../api';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import MiddlePost from './postComponents/MiddlePost';
import Photo from './postComponents/Photo';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Posts = ({navigation}) => {
  const salon = useSelector(state => state.auth.salon);
  const token = useSelector(state => state.auth.token);
  const [err, setErr] = useState('');
  const [postList, setpostList] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [isRefresh, setisRefresh] = useState(false);
  const [page, setpage] = useState(1);
  const [stopRefresh, setstopRefresh] = useState(false);
  const isFocused = useIsFocused();
  const flatListRef = useRef();

  useEffect(() => {
    if (isFocused) {
      getPosts();
    }
  }, [isFocused]);

  const getPosts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/salon/posts/page=1`, {
        headers: {
          Authorization: token,
        },
      });

      setpostList(res.data.posts);
      setpage(1);
      setstopRefresh(false);
      setisLoading(false);
      setisRefresh(false);
    } catch (err) {
      setErr(err.response.data.msg);
      setisLoading(false);
      setisRefresh(false);
    }
  };

  const deletePost = id => {
    Alert.alert('Supprimer Post', 'Vous voulez vraiment supprimer ce post', [
      {
        text: 'Oui',
        onPress: async () => {
          setisLoading(true);
          try {
            const res = await axios.delete(`${apiUrl}/post/delete_post/${id}`, {
              headers: {
                Authorization: token,
              },
            });
            setpostList(res.data.posts);
            setpage(1);
            setstopRefresh(false);
            setisLoading(false);
            setisRefresh(false);
          } catch (err) {
            setErr(err.response.data.msg);
            setisLoading(false);
            setisRefresh(false);
          }
        },
      },
      {
        text: 'Non',
        onPress: () => {},
        style: 'cancel',
      },
    ]);
  };

  const loadMore = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(`${apiUrl}/salon/posts/page=${page + 1}`, {
          headers: {
            Authorization: token,
          },
        });
        if (res.data.posts.length) {
          setpostList([...postList, ...res.data.posts]);
          setpage(page + 1);
        } else {
          setstopRefresh(true);
        }

        setisRefresh(false);
      } catch (err) {
        setErr(err.response.data.msg);
        setisRefresh(false);
      }
    }
  };

  const postItem = useCallback(({item}) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          margin: 10,
          backgroundColor: '#fff',
          borderRadius: 25,
          elevation: 5,
          minHeight: 95,
          zIndex: -1,
          position: 'relative',
        }}>
        <View
          style={{
            width: '80%',
            height: 55,
            marginRight: 10,
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            style={{
              width: 40,
              height: 40,
              marginHorizontal: 8,
              borderRadius: 20,
              overlayColor: '#fff',
            }}
            source={
              salon.avatar === ''
                ? DefaultAvatar
                : {
                    uri: salon.avatar,
                  }
            }
          />
          <Text
            numberOfLines={1}
            style={{
              fontWeight: 'bold',
              fontSize: 17,
              width: '100%',
              color: '#9b945f',
            }}>
            {salon.name}
          </Text>
        </View>
        <MiddlePost description={item.desc} />
        {item.photo !== '' && <Photo photo={item.photo} />}
        {item.photo !== '' ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Likes', {
                postId: item._id,
                like: 'likes',
              })
            }
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              backgroundColor: '#fff',
              padding: 3,
              borderRadius: 15,
              flex: 0,
              flexDirection: 'row',
              alignItems: 'center',
              elevation: 10,
            }}>
            <MaterialCommunityIcons
              style={{marginRight: 5}}
              name="heart"
              color={'#b73531'}
              size={40}
            />
            <Text
              style={{
                color: '#444',
                fontSize: 18,
                fontWeight: 'bold',
                marginRight: 4,
                elevation: 5,
              }}>
              {item.likesCount}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Likes', {
                postId: item._id,
                like: 'likes',
              })
            }
            style={{
              marginLeft: 10,
              marginBottom: 10,
              flex: 0,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <MaterialCommunityIcons
              style={{marginRight: 5}}
              name="heart"
              color={'#b73531'}
              size={40}
            />
            <Text
              style={{
                color: '#444',
                fontSize: 18,
                fontWeight: 'bold',
                marginRight: 4,
                elevation: 5,
              }}>
              {item.likesCount}
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}>
          <MaterialCommunityIcons
            style={{
              marginRight: 5,
            }}
            onPress={() => deletePost(item._id)}
            name="close"
            color={'#b73531'}
            size={35}
          />
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback(item => item._id, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <Header navigation={navigation} />

      {isLoading ? (
        <ActivityIndicator style={{marginTop: 20}} size="large" color="#222" />
      ) : postList.length ? (
        <>
          <TouchableOpacity
            onPress={() => {
              flatListRef.current.scrollToOffset({animated: true, offset: 0});
              navigation.navigate('AddPost');
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
              + Ajouter Post
            </Text>
          </TouchableOpacity>
          <FlatList
            ref={flatListRef}
            data={postList}
            renderItem={postItem}
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
            maxToRenderPerBatch={8}
            windowSize={10}
          />
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AddPost');
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
              + Ajouter Post
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#ccc',
              textTransform: 'uppercase',
              marginTop: 5,
              fontSize: 18,
            }}>
            Pas de post
          </Text>
        </>
      )}
    </SafeAreaView>
  );
};

export default Posts;
