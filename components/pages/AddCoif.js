import React, {useState} from 'react';
import {ScrollView, Text, TouchableOpacity, TextInput} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {apiUrl} from '../api';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import Loading from './Loading';
import {dispatchUpdateSalon} from '../../redux/actions/authAction';

const AddCoif = ({navigation}) => {
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const [coiffeur, setcoiffeur] = useState({name: '', speciality: ''});
  const [isDisable, setisDisable] = useState(true);
  const [err, setErr] = useState('');
  const [isLoading, setisLoading] = useState(false);

  const handleChange = (text, from) => {
    setErr('');
    setisDisable(false);
    setcoiffeur({...coiffeur, [from]: text});
  };

  const handleSubmit = async () => {
    setisLoading(true);
    if (coiffeur.name === '') {
      setErr('Remplisez tous les champs');
      setisLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${apiUrl}/team/add_team`,
        {
          name: coiffeur.name,
          speciality: coiffeur.speciality,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      dispatch(dispatchUpdateSalon(res));
      navigation.goBack();
    } catch (err) {
      setErr(err.response.data.msg);
      setisLoading(false);
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
            Ajouter Equipe
          </Text>
          <TextInput
            placeholder="Nom du person"
            style={{
              height: 45,
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 10,
              marginTop: 20,
              width: '95%',
              alignSelf: 'center',
            }}
            onChangeText={text => handleChange(text, 'name')}
          />
          <TextInput
            placeholder="Spécialité"
            style={{
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 10,
              width: '95%',
              alignSelf: 'center',
            }}
            onChangeText={text => handleChange(text, 'speciality')}
          />

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

export default AddCoif;
