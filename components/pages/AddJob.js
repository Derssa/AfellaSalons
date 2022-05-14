import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  View,
  ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Loading from './Loading';
import {apiUrl} from '../api';

const AddJob = ({navigation}) => {
  const {salon, token} = useSelector(state => state.auth);
  const [job, setjob] = useState({speciality: '', desc: '', salary: ''});
  const [isDisable, setisDisable] = useState(true);
  const [err, setErr] = useState('');
  const [isLoading, setisLoading] = useState(false);

  const handleChange = (text, from) => {
    setErr('');
    setisDisable(false);

    if (from === 'salary') {
      setjob({...job, [from]: text.replace(/[^0-9]/g, '')});
    } else {
      setjob({...job, [from]: text});
    }
  };

  const handleSubmit = async () => {
    if (salon.isValide === 'true') {
      setisLoading(true);
      if (job.speciality === '') {
        setErr('Remplisez la spacialité');
        setisLoading(false);
        return;
      }
      try {
        await axios.post(
          `${apiUrl}/job/add_job`,
          {
            speciality: job.speciality,
            desc: job.desc,
            salary: job.salary,
            location: salon.location,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
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
            Ajouter khdma wla stage
          </Text>
          <TextInput
            placeholder="Specialité"
            style={{
              height: 45,
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 10,
              marginTop: 20,
              width: '95%',
              alignSelf: 'center',
            }}
            onChangeText={text => handleChange(text, 'speciality')}
          />
          <TextInput
            placeholder="Description d'emplois (Pas Obligatoire)"
            multiline={true}
            numberOfLines={3}
            style={{
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 10,
              width: '95%',
              alignSelf: 'center',
              textAlignVertical: 'top',
              textAlign: 'justify',
            }}
            onChangeText={text => handleChange(text, 'desc')}
          />
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              width: '95%',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <TextInput
              placeholder="Salaire (Pas Obligatoire)"
              style={{
                backgroundColor: '#ddd',
                borderRadius: 10,
                marginBottom: 10,
                width: '90%',
                alignSelf: 'center',
              }}
              keyboardType="number-pad"
              onChangeText={text => handleChange(text, 'salary')}
              value={job.salary.toString()}
            />
            <Text
              style={{
                fontSize: 18,
                textAlign: 'right',
                fontWeight: 'bold',

                color: '#444',
                width: '10%',
              }}>
              DH
            </Text>
          </View>

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

export default AddJob;
