import React, {useState} from 'react';
import {ImageBackground, Text, View, ScrollView} from 'react-native';
import bg from '../../public/background.jpg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {Picker} from '@react-native-picker/picker';

const Help = ({navigation}) => {
  const [questions, setQuestions] = useState('1');

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
        Aide
      </Text>
      <View
        style={{
          backgroundColor: '#ddd',
          borderRadius: 10,
          width: '93%',
          alignSelf: 'center',
          marginTop: 20,
        }}>
        <Picker
          selectedValue={questions}
          onValueChange={(itemValue, itemIndex) => {
            setQuestions(itemValue);
          }}>
          <Picker.Item
            style={{
              fontSize: 13,
            }}
            label="كيفاش تضيف او تغير معلومات الصالون ديالك؟"
            value="1"
          />
          <Picker.Item
            style={{
              fontSize: 13,
            }}
            label="كيفاش تنظم المواعد مع زبائن ديالك؟"
            value="2"
          />
          <Picker.Item
            style={{
              fontSize: 13,
            }}
            label="كيفاش تنشر اعلان؟"
            value="3"
          />
          <Picker.Item
            style={{
              fontSize: 13,
            }}
            label="كيفاش تعمل تخفيض لزبائن ديالك؟"
            value="4"
          />
          <Picker.Item
            style={{
              fontSize: 13,
            }}
            label="كيفاش تنشر عرض عمل او تدريب؟"
            value="5"
          />
          <Picker.Item
            style={{
              fontSize: 13,
            }}
            label="شكون هي AFELLA؟"
            value="6"
          />
        </Picker>
      </View>
      <ScrollView
        style={{
          paddingHorizontal: 15,
          alignSelf: 'center',
          marginTop: 20,
        }}>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 13,
            color: '#C17112',
            marginBottom: 10,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
            }}>
            مهم:
          </Text>{' '}
          باش تبدا تاخد مواعيد من الزبناء ،خاص على الاقل شخص واحد من فريق عمل و
          واحد من الاثمنة ديالكم.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 8,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
            }}>
            1.
          </Text>{' '}
          اغلبية المعلومات الاساسية ديال صالون ديالك كتكون دخلتيها فاش تسجلتي،
          كيبقا ليك الموقع الخاص بالصالون لي غادي يظهر في تطبيق ديال الزبائن.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 8,
          }}>
          باش تدخل(ي) موقع الصالون ديالك، تاكد(ي) انك فالداخل دصالون او من بعد
          ضغط(ي) على{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Mon Salon
          </Text>{' '}
          لتحت ,من بعد ضغط(ي) على{' '}
          <Entypo name="location" color={'#9b945f'} size={20} /> باش تاخد موقع
          الصالون, و ضغط(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#216839',
            }}>
            MODIFIER
          </Text>{' '}
          باش اتسجل الموقع.
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#C17112',
            marginBottom: 15,
          }}>
          باش تأكد(ي) واش الموقع صحيح ضغط(ي) على{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#000',
            }}>
            TEST
          </Text>
          .
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 8,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
            }}>
            2.
          </Text>{' '}
          فاش كتزيد(ي) فريق العمل لصالون ديالك في تطبيق, كيخلي زبون يختار معامن
          ياخدو موعد فالفريق ديالكم.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 8,
          }}>
          باش تزيد(ي) واحد من فريق العمل ديالك, دخل(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Mon Salon
          </Text>{' '}
          لتحت, من بعد{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Equipe
          </Text>
          , من بعد ضغط(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Ajouter Coiffeur
          </Text>{' '}
          , من بعد دخل(ي) الاسم و تخصص ديالو او ديالها.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 15,
          }}>
          باش تمسح(ي) شخص من فريق العمل ديالك, دخل(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Mon Salon
          </Text>{' '}
          تحت, من بعد{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Equipe
          </Text>{' '}
          , من بعد ضغط(ي){' '}
          <MaterialCommunityIcons name="close" color={'#b73531'} size={20} />.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 8,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
            }}>
            3.
          </Text>{' '}
          فاش كتزيد(ي) الاثمنة دصالون ديالك في تطبيق, كيخلي زبون يختار شنو باغي
          اصوب عندكم فالموعد ديالو معاكم.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 8,
          }}>
          باش تزيد(ي) واحد ثمن من الاثمنة ديالكم, دخل(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Mon Salon
          </Text>{' '}
          لتحت, من بعد{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Coiffs
          </Text>
          , من بعد ضغط(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Ajouter Tarif
          </Text>{' '}
          , من بعد دخل(ي) الاسم و ثمن و تخصص ديالمن من فريق العمل.
        </Text>
        <Text
          style={{
            textAlign: 'right',
            fontSize: 15,
            marginBottom: 15,
          }}>
          باش تمسح(ي) واحد من الاثمنة ديالكم, دخل(ي){' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Mon Salon
          </Text>{' '}
          تحت, من بعد{' '}
          <Text
            style={{
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            Coiffs
          </Text>{' '}
          , من بعد ضغط(ي){' '}
          <MaterialCommunityIcons name="close" color={'#b73531'} size={20} />.
        </Text>
      </ScrollView>
    </ImageBackground>
  );
};

export default Help;
