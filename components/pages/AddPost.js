import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  View,
  ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import Loading from './Loading';
import {dispatchGetPosts} from '../../redux/actions/postsAction';
import analytics from '@react-native-firebase/analytics';
import {apiUrl} from '../api';

const AddPost = ({navigation}) => {
  const {salon, token} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [photo, setphoto] = useState('');
  const [height, setheight] = useState(400);
  const [desc, setdesc] = useState('');
  const [isDisable, setisDisable] = useState(true);
  const [err, setErr] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [image, setimage] = useState({});

  useEffect(() => {
    if (photo !== '') {
      Image.getSize(photo, (w, h) => {
        if (h <= 400) {
          setheight(h);
        } else {
          setheight(400);
        }
      });
    }
  }, [photo]);

  const handleChange = (text, from) => {
    setErr('');
    setisDisable(false);
    setdesc(text);
  };

  const getBlob = async fileUri => {
    const res = await fetch(fileUri);
    const imageBody = await res.blob();
    return imageBody;
  };

  const handleSubmit = async () => {
    if (salon.isValide === 'true') {
      setisLoading(true);
      if (desc === '') {
        setErr('Ajouter une description pour votre post');
        setisLoading(false);
        return;
      }

      let imageUrl = '';

      if (photo !== '') {
        try {
          const res = await axios.get(
            `${apiUrl}/upload_salon_post?type=${image.type.replace(
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
        const res = await axios.post(
          `${apiUrl}/post/add_post`,
          {
            desc,
            photo: imageUrl,
            location: salon.location,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        try {
          await analytics().logEvent('add_post', {
            salon: {id: salon._id, name: salon.name},
            desc,
          });
        } catch (err) {}
        dispatch(dispatchGetPosts(res));
        navigation.goBack();
      } catch (err) {
        setErr(err.response.data.msg);
        setisLoading(false);
      }
    } else {
      ToastAndroid.show(
        'Attendez la validation de votre compte',
        ToastAndroid.LONG,
      );
      navigation.goBack();
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView>
          <MaterialCommunityIcons
            style={{
              padding: 2,
              margin: 15,
            }}
            onPress={() => {
              navigation.goBack();
            }}
            name="window-close"
            color={'black'}
            size={30}
          />
          <Text
            style={{
              fontSize: 24,
              textAlign: 'center',
              color: '#444',
              marginBottom: 20,
            }}>
            Ajouter Post
          </Text>
          <TextInput
            placeholder="Description"
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
            onChangeText={text => handleChange(text)}
          />
          <TouchableOpacity
            onPress={() => {
              launchImageLibrary({mediaType: 'photo'}, res => {
                if (res.assets) {
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
                    setphoto(res.assets[0].uri);
                    setisDisable(false);
                    setErr('');
                  }
                }
              });
            }}
            style={{
              marginBottom: 10,
              alignSelf: 'center',
              width: '95%',
            }}>
            {photo === '' ? (
              <View
                style={{
                  width: '100%',
                  height: 300,
                  borderRadius: 20,
                  backgroundColor: '#ccc',
                  borderWidth: 5,
                  borderStyle: 'dashed',
                  borderColor: '#999',
                }}>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 24,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#999',
                  }}>
                  Choisissez photo
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#999',
                  }}>
                  (Pas Obligatoire)
                </Text>
              </View>
            ) : (
              <Image
                style={{
                  width: '100%',
                  height: height,
                  borderRadius: 20,
                  borderWidth: 5,
                  borderColor: '#999',
                  overlayColor: '#eee',
                }}
                source={{uri: photo}}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isDisable}
            style={{
              marginBottom: 10,
              backgroundColor: isDisable ? '#9b945f50' : '#9b945f',
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
              Ajouter
            </Text>
          </TouchableOpacity>
          {err !== '' && (
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#E54545',
                textTransform: 'uppercase',
                marginTop: 5,
              }}>
              {err}
            </Text>
          )}
        </ScrollView>
      )}
    </>
  );
};

export default AddPost;
