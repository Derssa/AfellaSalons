import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import bg from '../../public/background.jpg';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {apiUrl} from '../api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused} from '@react-navigation/native';

const Jobs = ({navigation}) => {
  const {token} = useSelector(state => state.auth);
  const [jobList, setjobList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getJobs();
    }
  }, [isFocused]);

  const getJobs = async () => {
    setisLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/salon/jobs`, {
        headers: {
          Authorization: token,
        },
      });
      setjobList(res.data.jobs);
      setisLoading(false);
    } catch (err) {
      setisLoading(false);
    }
  };

  const deleteJob = id => {
    Alert.alert(
      'Supprimer offre de khdma',
      'Vous voulez vraiment supprimer ce offre de khdma',
      [
        {
          text: 'Oui',
          onPress: async () => {
            setisLoading(true);
            try {
              const res = await axios.delete(`${apiUrl}/job/delete_job/${id}`, {
                headers: {
                  Authorization: token,
                },
              });
              setjobList(res.data.jobs);
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

  return (
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
          fontFamily: 'Painting_With_Chocolate',
          textAlign: 'center',
        }}>
        Emploi & stage
      </Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('AddJob');
        }}
        style={{
          marginTop: 20,
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
          + Ajouter emploi ou stage
        </Text>
      </TouchableOpacity>
      {isLoading ? (
        <ActivityIndicator style={{marginTop: 20}} size="large" color="#222" />
      ) : (
        <ScrollView
          style={{
            flex: 0,
            flexDirection: 'column',
            width: '100%',
            marginVertical: 5,
          }}>
          {jobList.length ? (
            jobList.map(job => (
              <View
                key={job._id}
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
                    {job.speciality}
                  </Text>
                  {job.desc !== '' && (
                    <Text
                      numberOfLines={3}
                      style={{
                        fontSize: 12,
                        color: '#333',
                      }}>
                      {job.desc}
                    </Text>
                  )}

                  {job.salary !== '' && (
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        color: '#9b945f',
                        fontWeight: 'bold',
                      }}>
                      {job.salary + '.00 DH'}
                    </Text>
                  )}
                </View>
                <TouchableOpacity>
                  <MaterialCommunityIcons
                    onPress={() => deleteJob(job._id)}
                    name="close"
                    color={'#b73531'}
                    size={30}
                  />
                </TouchableOpacity>
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
              Pas d'emploi
            </Text>
          )}
        </ScrollView>
      )}
    </ImageBackground>
  );
};

export default Jobs;
