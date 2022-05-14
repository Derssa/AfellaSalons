import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {apiUrl} from '../api';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import Loading from './Loading';
import {dispatchUpdateSalon} from '../../redux/actions/authAction';

const AddTarif = ({navigation}) => {
  const token = useSelector(state => state.auth.token);
  const salon = useSelector(state => state.auth.salon);
  const [team, setteam] = useState(
    salon.team.map(t => {
      t.isSelected = false;
      return t;
    }),
  );

  const dispatch = useDispatch();
  const [coiff, setcoiff] = useState({name: '', price: ''});
  const [teams, setteams] = useState([]);
  const [isDisable, setisDisable] = useState(true);
  const [err, setErr] = useState('');
  const [isLoading, setisLoading] = useState(false);

  const handleChange = (text, from) => {
    setErr('');
    setisDisable(false);

    if (from === 'price') {
      setcoiff({...coiff, [from]: text.replace(/[^0-9]/g, '')});
    } else {
      setcoiff({...coiff, [from]: text});
    }
  };
  const handleTeamChange = (id, isSelected, index) => {
    setErr('');
    setisDisable(false);
    if (isSelected) {
      const newTeams = teams.filter(item => {
        return item !== id;
      });
      setteams(newTeams);

      if (index === 0) {
        if (team.length > 1) {
          setteam([
            {
              ...team[index],
              isSelected: false,
            },
            ...team.slice(index + 1, team.length),
          ]);
        } else {
          setteam([
            {
              ...team[index],
              isSelected: false,
            },
          ]);
        }
      } else if (index > 0 && index < team.length - 1) {
        setteam([
          ...team.slice(0, index),
          {
            ...team[index],
            isSelected: false,
          },
          ...team.slice(index + 1, team.length),
        ]);
      } else if (index === team.length - 1) {
        setteam([
          ...team.slice(0, index),
          {
            ...team[index],
            isSelected: false,
          },
        ]);
      }
    } else {
      setteams([...teams, id]);

      if (index === 0) {
        if (team.length > 1) {
          setteam([
            {
              ...team[index],
              isSelected: true,
            },
            ...team.slice(index + 1, team.length),
          ]);
        } else {
          setteam([
            {
              ...team[index],
              isSelected: true,
            },
          ]);
        }
      } else if (index > 0 && index < team.length - 1) {
        setteam([
          ...team.slice(0, index),
          {
            ...team[index],
            isSelected: true,
          },
          ...team.slice(index + 1, team.length),
        ]);
      } else if (index === team.length - 1) {
        setteam([
          ...team.slice(0, index),
          {
            ...team[index],
            isSelected: true,
          },
        ]);
      }
    }
  };

  const handleSubmit = async () => {
    setisLoading(true);
    if (coiff.name === '') {
      setErr('Remplisez tous les champs');
      setisLoading(false);
      return;
    }
    try {
      const res = await axios.post(
        `${apiUrl}/coiff/add_coiff`,
        {
          name: coiff.name,
          price: coiff.price,
          team: teams,
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
            Ajouter Tarif
          </Text>
          <TextInput
            placeholder="Nom du Coiff"
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
              placeholder="Prix"
              keyboardType="numeric"
              style={{
                backgroundColor: '#ddd',
                borderRadius: 10,
                marginBottom: 10,
                width: '90%',
                alignSelf: 'center',
              }}
              onChangeText={text => handleChange(text, 'price')}
              value={coiff.price.toString()}
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
          <Text
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#666',
              marginBottom: 10,
            }}>
            Specialité de:
          </Text>
          {team.map((coiffeur, index) => (
            <TouchableOpacity
              onPress={() => {
                handleTeamChange(coiffeur._id, coiffeur.isSelected, index);
              }}
              key={coiffeur._id}
              style={{
                backgroundColor: coiffeur.isSelected ? '#fff' : '#eee',
                padding: 10,
                elevation: 5,
                borderRadius: 10,
                width: '95%',
                borderWidth: 2,
                borderColor: coiffeur.isSelected ? '#216839' : '#ccc',
                marginBottom: 15,
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: coiffeur.isSelected ? '#000' : '#999',
                }}>
                {coiffeur.name}
              </Text>
            </TouchableOpacity>
          ))}

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

export default AddTarif;
